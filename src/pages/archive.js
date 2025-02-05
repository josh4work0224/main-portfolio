import WorksArchive from "@/components/WorksArchive";
import Footer from "@/components/Footer";
import { createClient } from "contentful";

export default function Archive({ totalWorks }) {
  return (
    <div className="flex flex-col gap-16 font-['Funnel_Sans']">
      <main className="w-full py-32 lg:px-8 px-4">
        <h1 className="md:text-7xl text-4xl">Works Archive ({totalWorks})</h1>
        <WorksArchive />
      </main>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  });

  const response = await client.getEntries({
    content_type: "works",
  });

  return {
    props: {
      totalWorks: response.total,
    },
    revalidate: 60, // 重新生成頁面的間隔時間（秒）
  };
}
