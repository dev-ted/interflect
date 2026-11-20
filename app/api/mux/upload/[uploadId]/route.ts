import Mux from "@mux/ts";
import { getServerAuthContext } from "@/lib/server-auth";

const MISSING_MUX_CREDS_ERROR =
  "Mux credentials not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to .env.local.";

export async function GET(
  _request: Request,
  context: { params: Promise<{ uploadId: string }> },
) {
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

  const { uploadId } = await context.params;
  if (!uploadId) {
    return Response.json({ error: "Missing uploadId" }, { status: 400 });
  }

  try {
    const mux = new Mux({ tokenId, tokenSecret });
    const upload = await mux.video.uploads.retrieve(uploadId);

    if (upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id);
      return Response.json({
        status: asset.status,
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id ?? null,
        duration: asset.duration ?? null,
      });
    }

    return Response.json({
      status: upload.status,
      assetId: null,
      playbackId: null,
      duration: null,
    });
  } catch (error) {
    if (error instanceof Mux.NotFoundError) {
      return Response.json({ error: "Mux upload not found." }, { status: 404 });
    }
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve Mux upload status.";
    return Response.json({ error: message }, { status: 500 });
  }
}
