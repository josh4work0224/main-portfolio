import React, { useEffect, useState } from "react";
import { createClient } from "contentful";
import Link from "next/link";
import Image from "next/image";

const WorksArchive = () => {
  const [works, setWorks] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [allTypes, setAllTypes] = useState([]);

  useEffect(() => {
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
        console.log("API Response:", response.items[0]?.fields);

        const worksWithSlugs = response.items.map((item) => ({
          ...item,
          fields: {
            ...item.fields,
            slug: item.fields.slug || item.sys.id,
            category: Array.isArray(item.fields.category)
              ? item.fields.category
              : item.fields.category
              ? [item.fields.category]
              : [],
          },
        }));
        setWorks(worksWithSlugs);
        
        const types = new Set();
        worksWithSlugs.forEach(work => {
          work.fields.type?.forEach(type => {
            types.add(type.fields?.tagName);
          });
        });
        setAllTypes(['all', ...Array.from(types)]);
      })
      .catch(console.error);
  }, []);

  const filteredAndSortedWorks = works
    .filter(work => {
      if (selectedType === 'all') return true;
      return work.fields.type?.some(type => type.fields?.tagName === selectedType);
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.sys.createdAt) - new Date(a.sys.createdAt);
      } else {
        return new Date(a.sys.createdAt) - new Date(b.sys.createdAt);
      }
    });

  return (
    <section className="mt-[8rem] relative z-[95] bg-black w-full">
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {allTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded ${
                selectedType === type 
                  ? 'bg-white text-black' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          <option value="newest">最新順序</option>
          <option value="oldest">最舊順序</option>
        </select>
      </div>

      <div className="w-full mx-auto">
        {filteredAndSortedWorks.map((work) => (
          <Link
            href={`/works/${work.fields.slug}`}
            key={work.sys.id}
            className="block group"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start py-8 border-b border-gray-800 hover:bg-gray-900/30 transition-all duration-300 gap-6">
              <div className="space-y-4 flex-1">
                <h3 className="text-5xl font-light text-white group-hover:translate-x-2 transition-transform duration-300">
                  {work.fields.client}
                </h3>
                <div className="flex flex-wrap gap-2">
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
              </div>

              <div className="flex flex-col items-end gap-4">
                {work.fields.animate?.fields?.file?.url && (
                  <div className="relative h-[5rem] aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={`https:${work.fields.animate.fields.file.url}`}
                      alt={work.fields.animate.fields.file.title || "Animation"}
                      fill
                      className="object-cover"
                      style={{
                        animationPlayState: "var(--animation-play-state, running)"
                      }}
                    />
                  </div>
                )}
                <span className="inline-block text-white text-lg font-light opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  View Project
                  <span className="ml-2">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default WorksArchive;
