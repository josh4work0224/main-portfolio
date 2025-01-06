import React, { useEffect, useState } from "react";
import { createClient } from "contentful";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

const ContentfulSection = () => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
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
  

  useEffect(() => {
    const workItems = document.querySelectorAll(".work-item");
  
    const triggers = workItems.forEach((item) => {
      return ScrollTrigger.create({
        trigger: item,
        start: "top center",
        endTrigger: item,
        end: "bottom center",
        scrub: 0.5, // Smoother animation
        onLeave: () =>
          gsap.to(item, {
            scale: 0.95,
            filter: "blur(2px)",
            ease: "power1.inOut" // Smoother easing
          }),
        onEnterBack: () =>
          gsap.to(item, {
            scale: 1,
            filter: "blur(0px)",
            ease: "power1.inOut"
          }),
        invalidateOnRefresh: true, // Key modification
        scroller: window // Explicit scroller
      });
    });

    const triggersIn = workItems.forEach((item) => {
      const textElement = item.querySelector(".text-animation"); // Target text
      const dividerElement = item.querySelector(".divider-animation"); // Target divider
      const animateElement = item.querySelector(".work-animate")

      ScrollTrigger.create({
        trigger: item,
        start: "top 30%", // Trigger when the top of the item is 80% from the top of the viewport
        end: "bottom 20%", // End when the bottom of the item is 20% from the top of the viewport
        onEnter: () => {
          gsap.fromTo(textElement, 
            { opacity: 0, y: 20 }, // Start state for text
            { opacity: 1, y: 0, duration: 1, ease: "power1.out" } // End state for text
          );
          gsap.fromTo(dividerElement, 
            { scaleX: 0 }, // Start state for divider
            { scaleX: 1, duration: 1, ease: "power1.out" } // End state for divider
          );
          gsap.fromTo(animateElement, 
            { scale: 0 }, // Start state for divider
            { scale: 1, duration: 1, ease: "power1.out" } // End state for divider
          );
        },
        onLeaveBack: () => {
          gsap.to(textElement, { opacity: 0, y: 20, duration: 0.5, ease: "power1.in" });
          gsap.to(dividerElement, { scaleX: 0, duration: 0.5, ease: "power1.in" });
          gsap.to(animateElement, { scale: 0, duration: 0.5, ease: "power1.in" });
        },
        invalidateOnRefresh: true,
        scroller: window
      });
    });

  
    // Cleanup
    return () => {
      workItems.forEach((_, index) => {
        ScrollTrigger.getAll()[index]?.kill();
      });
    };
  }, [works]);

  return (
    <div className="flex flex-col gap-16 relative">
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
                     <div key={categoryRef.sys.id} className="text-md px-1 mr-2 text-slate-600 uppercase bg-white leading-tight font-semibold">
                      <h4>
                       {categoryRef.fields?.tagName || "Unnamed Category"} 
                      </h4>
                     </div>
                    ))}
                  </div>
                <div className="h-[1px] w-full bg-gray-200 divider-animation origin-left"></div>
                <div className="flex flex-col content-start py-2">
                 <span className="text-md text-white uppercase tracking-wide font-semibold"><span className="text-lime-300">[ </span>{work.fields.name} <span className="text-lime-300"> ]</span></span>
                 <span className="lg:block hidden text-xl text-white mb-2 w-[60%] font-thin leading-tight">{work.fields.overview}</span>
                  
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
