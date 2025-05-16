import { Html, Head, Main, NextScript } from "next/document";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/chi4favicon.ico" />
      </Head>
      <body className="antialiased bg-black">
        <Main />
        <NextScript />
        <SpeedInsights />
        <Analytics />
      </body>
    </Html>
  );
}
