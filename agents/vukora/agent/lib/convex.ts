export function getConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL environment variable.",
    );
  }
  return url;
}

export async function createConvexClient(clerkToken?: string | null) {
  const { ConvexHttpClient } = await import("convex/browser");
  const client = new ConvexHttpClient(getConvexUrl());
  if (clerkToken) {
    client.setAuth(clerkToken);
  }
  return client;
}

export async function getConvexApi() {
  const { api } = await import("../../../../convex/_generated/api");
  return api;
}

export async function fetchCatalogSnapshot(args: {
  courseSlug?: string;
  lessonSlug?: string;
}) {
  const [client, api] = await Promise.all([
    createConvexClient(),
    getConvexApi(),
  ]);
  return await client.query(api.courses.getCatalogSnapshot, args);
}

export async function fetchUserProgressForAgent(clerkToken: string) {
  const [client, api] = await Promise.all([
    createConvexClient(clerkToken),
    getConvexApi(),
  ]);
  return await client.query(api.enrollments.getUserProgressForAgent, {});
}
