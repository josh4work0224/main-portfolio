import React, { useEffect, useState } from 'react';
import { createClient } from 'contentful';
import Link from 'next/link';
import Image from 'next/image';

const WorksArchive = () => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || !process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN) {
      console.error('環境變數未正確設置');
      return;
    }

    const client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    });

    client
      .getEntries({
        content_type: 'works',
        include: 2,
      })
      .then((response) => {
        // 添加 console.log 來檢查數據結構
        console.log('API Response:', response.items[0]?.fields);

        const worksWithSlugs = response.items.map((item) => ({
          ...item,
          fields: {
            ...item.fields,
            slug: item.fields.slug || item.sys.id,
            // 確保 category 是一個陣列且為 Reference 類型
            category: Array.isArray(item.fields.category)
              ? item.fields.category
              : item.fields.category
              ? [item.fields.category]
              : [],
          },
        }));
        setWorks(worksWithSlugs);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="mt-[8rem] relative z-[95] bg-black w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map((work) => (
          <Link href={`/works/${work.fields.slug}`} key={work.sys.id} className="block">
            <div className="block group">
              <div className="overflow-hidden relative w-full h-72">
                {work.fields.mainImage?.fields?.file?.url && (
                  <Image
                    src={`https:${work.fields.mainImage.fields.file.url}`}
                    alt={work.fields.name || 'Work image'}
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                )}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
                  {Array.isArray(work.fields.type) &&
                    work.fields.type.map((categoryRef) => (
                      <span
                        key={categoryRef.sys.id}
                        className="px-2 py-1 bg-gray-800 text-white text-sm"
                      >
                        {categoryRef.fields?.tagName || 'Unnamed Category'}
                      </span>
                    ))}
                </div>
              </div>
              <div className="py-2">
                <span className="py-2 text-white text-sm">{work.fields.client}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{work.fields.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default WorksArchive;
