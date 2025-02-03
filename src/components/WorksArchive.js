import React, { useEffect, useState, useRef } from "react";
import { createClient } from "contentful";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useRouter } from "next/router";

const WorksArchive = ({ initialWorks }) => {
  const [works, setWorks] = useState(initialWorks || []);
  const [sortOrder, setSortOrder] = useState("newest");
  const gridRef = useRef(null);
  const [pageKey, setPageKey] = useState(0);
  const router = useRouter();
  const isTransitioning = useRef(false);
  const pendingSortChange = useRef(null);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const columnOffsets = {
      0: { start: 0, end: 0 },
      1: { start: 120, end: -120 },
      2: { start: 40, end: -40 },
      3: { start: 80, end: -80 },
    };

    const initAnimation = () => {
      console.log("Initializing WorksArchive animations");

      const cards = gridRef.current?.querySelectorAll(".work-card");
      if (!cards?.length) return;

      cards.forEach((card, index) => {
        const columnIndex = index % 4;
        const { start } = columnOffsets[columnIndex];
        gsap.set(card, { y: start });
      });

      requestAnimationFrame(() => {
        cards.forEach((card, index) => {
          const columnIndex = index % 4;
          const { start, end } = columnOffsets[columnIndex];

          gsap.fromTo(
            card,
            { y: start },
            {
              y: end,
              duration: 1,
              ease: "none",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 30%",
                end: "center 30%",
                scrub: 1,
                invalidateOnRefresh: true,
                fastScrollEnd: true,
              },
            }
          );
        });
      });
    };

    const handleTransitionComplete = () => {
      console.log("Page transition complete - reinitializing animations");
      setTimeout(() => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
        setPageKey((prev) => prev + 1);
        initAnimation();
      }, 100);
    };

    if (document.readyState === "complete") {
      initAnimation();
    } else {
      window.addEventListener("load", initAnimation);
    }

    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
      window.removeEventListener("load", initAnimation);
    };
  }, [works, sortOrder, pageKey, router]);

  const handleSortChange = () => {
    if (isTransitioning.current) {
      // 如果正在轉場中，將排序變更儲存起來
      pendingSortChange.current = sortOrder === "newest" ? "oldest" : "newest";
      return;
    }

    // 否則直接更新排序
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  const sortedWorks = [...works].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.sys.createdAt) - new Date(a.sys.createdAt);
    } else {
      return new Date(a.sys.createdAt) - new Date(b.sys.createdAt);
    }
  });

  return (
    <section
      className="mt-[8rem] relative z-[95] bg-black w-full"
      key={pageKey}
    >
      <div className="mb-8 flex justify-start">
        <button
          onClick={handleSortChange}
          className="text-white py-2 flex items-center gap-2"
        >
          <span>{sortOrder === "newest" ? "Latest" : "Oldest"}</span>
          <span className="text-sm">↑↓</span>
        </button>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {sortedWorks.map((work) => (
          <Link
            href={`/works/${work.fields.slug}`}
            key={work.sys.id}
            className="block group relative work-card"
            scroll={false}
          >
            <div className="border border-white/10 p-6 h-[300px] relative overflow-hidden">
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
                          className="px-[2px] py-[1px] mr-2 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]"
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
