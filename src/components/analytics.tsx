import { GoogleAnalytics } from "@next/third-parties/google";
import { publicEnv } from "@/lib/env";

/**
 * Loads Google Analytics 4 only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so
 * local/dev builds without the env var don't ship or call gtag.
 *
 * `@next/third-parties` handles script loading and automatic pageview tracking
 * for App Router navigations. Send custom events with `sendGAEvent` from
 * `@next/third-parties/google`.
 */
export function Analytics() {
  const gaId = publicEnv.gaMeasurementId;
  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
