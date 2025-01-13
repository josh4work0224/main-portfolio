import React, { useEffect, useState } from "react";
import { createClient } from "contentful";
import Link from "next/link";
import Image from "next/image";

const WorksArchive = ({ initialWorks }) => {
  const [works, setWorks] = useState(initialWorks || []);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (initialWorks?.length > 0) return;

    if (
      !process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ||
      !process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
    ) {
      console.error("環境變數未正確設置");
      return;
    }

    const client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    });

    client
      .getEntries({
        content_type: "works",
        include: 2,
      })
      .then((response) => {
        const worksWithSlugs = response.items.map((item) => ({
          ...item,
          fields: {
            ...item.fields,
            slug: item.fields.slug || item.sys.id,
          },
        }));
        setWorks(worksWithSlugs);
      })
      .catch(console.error);
  }, [initialWorks]);

  const sortedWorks = [...works].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.sys.createdAt) - new Date(a.sys.createdAt);
    } else {
      return new Date(a.sys.createdAt) - new Date(b.sys.createdAt);
    }
  });

  return (
    <section className="mt-[8rem] relative z-[95] bg-black w-full">
      <div className="mb-8 flex justify-start">
        <button
          onClick={() =>
            setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
          }
          className=" text-white py-2 flex items-center gap-2"
        >
          <span>{sortOrder === "newest" ? "Latest" : "Oldest"}</span>
          <span className="text-sm">↑↓</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedWorks.map((work) => (
          <Link
            href={`/works/${work.fields.slug}`}
            key={work.sys.id}
            className="block group relative"
            scroll={false}
          >
            <div className="border border-white/10 p-6 h-[300px] relative overflow-hidden">
              {/* Hover Background Image */}
              {work.fields.animate?.fields?.file?.url && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <Image
                    src={`https:${work.fields.animate.fields.file.url}`}
                    alt={work.fields.animate.fields.file.title || "Animation"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <h2 className="text-5xl font-light text-white group-hover:translate-x-2 transition-transform duration-300">
                  {work.fields.client}
                </h2>

                <div className="flex justify-between items-end">
                  <div className="flex flex-wrap max-w-[80%]">
                    {Array.isArray(work.fields.type) &&
                      work.fields.type.map((categoryRef) => (
                        <span
                          key={categoryRef.sys.id}
                          className="text-md font-thin px-1 mr-2 text-slate-600 uppercase bg-white leading-tight"
                        >
                          {categoryRef.fields?.tagName || "Unnamed Category"}
                        </span>
                      ))}
                  </div>

                  <span className="text-white text-2xl transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default WorksArchive;
