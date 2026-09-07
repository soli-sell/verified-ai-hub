'use client';

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";

export default function AnalyticsProvider() {
  return (
    <>
      <VercelAnalytics debug={true} />
      <VercelSpeedInsights debug={true} sampleRate={1} />
    </>
  );
}
