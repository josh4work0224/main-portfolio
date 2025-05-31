import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
          media="print"
          onLoad="this.media='all'"
        />
        <link rel="icon" href="/chi4favicon.ico" />
      </Head>
      <body className="antialiased bg-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
