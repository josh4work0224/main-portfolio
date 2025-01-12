import React, { useEffect, useState } from "react";
import { createClient } from "contentful";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useRouter } from "next/router";

const ContentfulSection = () => {
  const [works, setWorks] = useState([]);
  const [remountKey, setRemountKey] = useState(0);
  const router = useRouter();

  // Initialize animations function
  const initializeAnimations = () => {
    console.log("Initializing animations");

    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      ScrollTrigger.refresh();

      const workItems = document.querySelectorAll(".work-item");
      workItems.forEach((item) => {
        const textElement = item.querySelector(".text-animation");
        const dividerElement = item.querySelector(".divider-animation");
        const animateElement = item.querySelector(".work-animate");

        // Reset animations to initial state
        gsap.set([textElement, dividerElement, animateElement], {
          clearProps: "all",
        });

        // Re-create ScrollTrigger instances
        ScrollTrigger.create({
          trigger: item,
          start: "top center",
          endTrigger: item,
          end: "bottom center",
          scrub: 0.5,
          onLeave: () =>
            gsap.to(item, {
              scale: 0.95,
              filter: "blur(2px)",
              ease: "power1.inOut",
            }),
          onEnterBack: () =>
            gsap.to(item, {
              scale: 1,
              filter: "blur(0px)",
              ease: "power1.inOut",
            }),
          invalidateOnRefresh: true,
        });

        // Re-create text animations
        ScrollTrigger.create({
          trigger: item,
          start: "top 30%",
          end: "bottom 20%",
          onEnter: () => {
            gsap.fromTo(
              textElement,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 1, ease: "power1.out" }
            );
            gsap.fromTo(
              dividerElement,
              { scaleX: 0 },
              { scaleX: 1, duration: 1, ease: "power1.out" }
            );
            gsap.fromTo(
              animateElement,
              { scale: 0 },
              { scale: 1, duration: 1, ease: "power1.out" }
            );
          },
          onLeaveBack: () => {
            gsap.to(textElement, {
              opacity: 0,
              duration: 0.5,
              ease: "power1.in",
            });
            gsap.to(dividerElement, { scaleX: 0 });
            gsap.to(animateElement, { scale: 0 });
          },
          invalidateOnRefresh: true,
        });
      });
    }, 100);
  };

  // Handle initial load and works data changes
  useEffect(() => {
    if (works.length > 0) {
      console.log("Works data loaded - initializing animations");
      initializeAnimations();
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [works]);

  // Listen for transition completion
  useEffect(() => {
    const handleTransitionComplete = () => {
      console.log("Page transition complete - reinitializing animations");
      setTimeout(() => {
        setRemountKey((prev) => prev + 1);
        initializeAnimations();
      }, 100);
    };

    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      window.removeEventListener("pageTransitionComplete", handleTransitionComplete);
    };
  }, []);

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
        // 添加 console.log 來檢查數據結構
        console.log("API Response:", response.items[0]?.fields);

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
    <div key={remountKey} className="flex flex-col gap-16 relative">
      {works.map((work, index) => (
        <Link
          href={`/works/${work.fields.slug}`}
          key={work.sys.id}
          className="work-item block sticky top-[10vh] bg-black border  border-gray-200"
          scroll={false}
        >
          <div className="block group">
            <div className="overflow-hidden relative w-full h-[80vh] flex flex-col">
              <div className="w-full h-full abosulte">
                {work.fields.mainImage?.fields?.file?.url && (
                  <Image
                    src={`https:${work.fields.mainImage.fields.file.url}`}
                    alt={work.fields.name || "Work image"}
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                )}
                <div className="absolute w-full h-full bg-slate-800/[0.5] p-4">
                  <div className="lg:w-[25%] w-full aspect-video abosulte top-2 left-2 z-40 border border-gray-200 rounded-md work-animate origin-top-left scale-0 overflow-hidden">
                    {work.fields.animate?.fields?.file?.url && (
                      <Image
                        src={`https:${work.fields.animate.fields.file.url}`}
                        alt={
                          work.fields.animate.fields.file.title ||
                          "Gallery image"
                        }
                        width={1920}
                        height={1080}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="relative h-full flex flex-col justify-end lg:px-8 px-4 py-4 items-start">
                <div className="flex flex-col relative w-auto ">
                  <h3 className="text-4xl text-white font-bold self-start z-[50] text-animation">
                    {work.fields.client}
                  </h3>
                  <div className="absolute h-2 w-2 bg-lime-300 top-0 -right-2"></div>
                </div>
                <div className="flex flex-row pb-3 pt-1">
                  {Array.isArray(work.fields.type) &&
                    work.fields.type.map((categoryRef) => (
                      <div
                        key={categoryRef.sys.id}
                        className="text-md px-1 mr-2 text-slate-600 uppercase bg-white leading-tight font-semibold"
                      >
                        <h4>
                          {categoryRef.fields?.tagName || "Unnamed Category"}
                        </h4>
                      </div>
                    ))}
                </div>
                <div className="h-[1px] w-full bg-gray-200 divider-animation origin-left"></div>
                <div className="flex flex-col content-start py-2">
                  <span className="text-md text-white uppercase tracking-wide font-semibold">
                    <span className="text-lime-300">[ </span>
                    {work.fields.name} <span className="text-lime-300"> ]</span>
                  </span>
                  <span className="lg:block hidden text-lg text-white mb-2 w-[60%] font-thin leading-tight">
                    {work.fields.overview}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ContentfulSection;
