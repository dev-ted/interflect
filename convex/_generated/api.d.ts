/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as files from "../files.js";
import type * as insights from "../insights.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_features from "../lib/features.js";
import type * as lib_media from "../lib/media.js";
import type * as lib_rateLimits from "../lib/rateLimits.js";
import type * as lib_transcripts from "../lib/transcripts.js";
import type * as lib_video from "../lib/video.js";
import type * as rateLimits from "../rateLimits.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  courses: typeof courses;
  enrollments: typeof enrollments;
  files: typeof files;
  insights: typeof insights;
  "lib/access": typeof lib_access;
  "lib/auth": typeof lib_auth;
  "lib/features": typeof lib_features;
  "lib/media": typeof lib_media;
  "lib/rateLimits": typeof lib_rateLimits;
  "lib/transcripts": typeof lib_transcripts;
  "lib/video": typeof lib_video;
  rateLimits: typeof rateLimits;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
