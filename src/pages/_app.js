import "@/styles/globals.css";
import Transition from "@/components/Transition";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { LenisProvider } from "@/components/smoothScroll";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function App({ Component, pageProps }) {
  return (
    <LenisProvider>
      <main style={{ minHeight: "100vh" }}>
        <Head>
          <link rel="icon" href="/chi4favicon.ico" />
        </Head>
        <Navbar />
        <Transition>
          <Component {...pageProps} />
        </Transition>
        <SpeedInsights />
        <Analytics />
      </main>
    </LenisProvider>
  );
}
