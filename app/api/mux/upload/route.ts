import Mux from "@mux/ts";
import { getServerAuthContext } from "@/lib/server-auth";

const MISSING_MUX_CREDS_ERROR =
  "Mux credentials not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to .env.local.";

export async function POST(request: Request) {
  const { isAuthenticated, isAdmin } = await getServerAuthContext();

  if (!isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    return Response.json({ error: MISSING_MUX_CREDS_ERROR }, { status: 503 });
  }

  try {
    const mux = new Mux({ tokenId, tokenSecret });
    const upload = await mux.video.uploads.create({
      cors_origin: request.headers.get("origin") || "*",
      new_asset_settings: {
        playback_policies: ["public"],
      },
    });

    if (!upload.url) {
      return Response.json(
        { error: "Mux did not return an upload URL." },
        { status: 502 },
      );
    }

    return Response.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create Mux direct upload.";
    return Response.json({ error: message }, { status: 500 });
  }
}
