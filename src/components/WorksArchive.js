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

    const initAnimation = () => {
      console.log("Initializing WorksArchive animations");
      // 清理現有的 ScrollTrigger 實例
      ScrollTrigger.getAll().forEach(st => st.kill());
      ScrollTrigger.clearMatchMedia();
      ScrollTrigger.refresh(true);

      const cards = gridRef.current?.querySelectorAll('.work-card');
      if (!cards?.length) return;

      // 定義每列的起始和結束位置
      const columnOffsets = {
        0: { start: 0, end: 0 },    // 第1列: 0 -> -40
        1: { start: 60, end: -60 },    // 第2列: 80 -> 40
        2: { start: 20, end: -20 },     // 第3列: 40 -> 0
        3: { start: 40, end: -40 }    // 第4列: 120 -> 80
      };

      cards.forEach((card, index) => {
        const columnIndex = index % 4;
        const { start, end } = columnOffsets[columnIndex];
        
        gsap.set(card, { y: start });

        gsap.to(card, {
          y: end,
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top center",
            end: "75% center",
            scrub: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          }
        });
      });
    };

    // 路由變化處理
    const handleRouteChangeStart = (url) => {
      console.log("Route change started to:", url);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };

    const handleRouteChangeComplete = (url) => {
      console.log("Route change completed to:", url);
      if (url === '/works') {
        console.log("Navigated to works - reinitializing animations");
        setPageKey(prev => prev + 1);
        setTimeout(() => {
          initAnimation();
        }, 100);
      }
    };

    // 頁面轉場完成事件處理
    const handleTransitionComplete = () => {
      console.log("Transition complete in WorksArchive");
      setPageKey(prev => prev + 1);
      setTimeout(() => {
        initAnimation();
      }, 100);
    };

    // 添加事件監聽
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    // 初始加載時初始化
    if (document.readyState === "complete") {
      initAnimation();
    } else {
      window.addEventListener("load", initAnimation);
    }

    // 清理函數
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      window.removeEventListener("pageTransitionComplete", handleTransitionComplete);
      window.removeEventListener("load", initAnimation);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [works, sortOrder, pageKey, router]);

  const sortedWorks = [...works].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.sys.createdAt) - new Date(a.sys.createdAt);
    } else {
      return new Date(a.sys.createdAt) - new Date(b.sys.createdAt);
    }
  });

  return (
    <section className="mt-[8rem] relative z-[95] bg-black w-full" key={pageKey}>
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

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedWorks.map((work) => (
          <Link
            href={`/works/${work.fields.slug}`}
            key={work.sys.id}
            className="block group relative work-card"
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
