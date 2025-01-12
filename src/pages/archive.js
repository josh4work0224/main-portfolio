import WorksArchive from "@/components/WorksArchive";
import Footer from "@/components/Footer";

export default function Archive() {
  return (
    <div className="flex flex-col gap-16 font-['Funnel_Sans']">
      <main className="w-full py-32 lg:px-8 px-4">
        <h1 className="text-7xl">Works Archive</h1>
        <WorksArchive />
      </main>
      <Footer />
    </div>
  );
}