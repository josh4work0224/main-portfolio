import WorksArchive from "@/components/WorksArchive";

export default function Archive() {
  return (
    <div className="flex flex-col gap-16 font-['Funnel_Sans']">
      <main className="w-full py-32 px-8">
        <h1 className="text-7xl">Works Archive</h1>
        <WorksArchive />
      </main>
    </div>
  );
}