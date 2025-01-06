import { createClient } from "contentful";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Link from "next/link";
import { useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useRouter } from "next/router";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Footer from "@/components/Footer";
import React from "react";
import PixelatedImage from "@/components/PixelatedImage";
import NextButton from "@/components/nextBttoun";

// getStaticPaths remains the same
export async function getStaticPaths() {
  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  });

  const res = await client.getEntries({
    content_type: "works",
  });

  const paths = res.items.map((item) => ({
    params: { slug: item.fields.slug || item.sys.id },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

// getStaticProps remains the same
export async function getStaticProps({ params }) {
  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  });

  const res = await client.getEntries({
    content_type: "works",
    "fields.slug": params.slug,
    include: 2,
  });

  if (!res.items.length) {
    return {
      notFound: true,
    };
  }

  const work = res.items[0];

  // 獲取 nextProject，如果存在的話
  let nextProject = null;
  if (work.fields.nextProject) {
    const nextProjectRes = await client.getEntry(
      work.fields.nextProject.sys.id
    );
    nextProject = nextProjectRes.fields;

    // 移除或轉換 nextProject 中的循環引用
    if (nextProject.nextProject) {
      delete nextProject.nextProject; // 移除循環引用
    }
  }

  return {
    props: {
      work: {
        ...work,
        fields: {
          ...work.fields,
          nextProject: nextProject ? { ...nextProject } : null,
        },
      },
    },
    revalidate: 60,
  };
}

// Rich text renderer options
const richTextOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-4 text-lg leading-tight">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-4xl font-bold mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-bold mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-bold mb-3">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc ml-6 mb-4">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal ml-6 mb-4">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-2">{children}</li>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        className="text-blue-400 hover:text-blue-300 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { url, fileName } = node.data.target.fields.file;
      return (
        <div className="my-8">
          <Image
            src={`https:${url}`}
            alt={fileName}
            className="max-w-full h-auto"
          />
        </div>
      );
    },
  },
};

const WorkDetail = ({ work }) => {
  const nextProject = work.fields.nextProject;
  console.log("Next Project Data:", nextProject);

  const router = useRouter();
  const [index, setIndex] = useState(-1);

  const slides =
    work?.fields?.imageGallery?.map((image) => ({
      src: `https:${image.fields.file.url}`,
      alt: image.fields.file.title || "Gallery image",
      width: 1920,
      height: 1080,
    })) || [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const initAnimation = () => {
      const overlay = document.querySelector("#hero-overlay");
      const heroProject = document.querySelector("#hero-space");
      const heroText = document.querySelector("#text-hero");

      if (!overlay || !heroProject) {
        setTimeout(initAnimation, 100);
        return;
      }

      // 先清理所有現有的 triggers
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      // 重置 ScrollTrigger
      ScrollTrigger.clearMatchMedia();
      ScrollTrigger.refresh(true);

      // 等待一下再初始化新的動畫
      const timer = setTimeout(() => {
        // 創建主要的動畫 timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroProject,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            immediateRender: false,
            onEnter: () => {
              if (overlay) {
                gsap.to(overlay, {
                  opacity: 0.85,
                  filter: "brightness(0.2)",
                  duration: 0.3,
                  ease: "power2.inOut",
                });
              }
              if (heroText) {
                gsap.to(heroText, {
                  opacity: 0,
                  duration: 0.3,
                  ease: "power2.inOut",
                });
              }
            },
            onLeaveBack: () => {
              if (overlay) {
                gsap.to(overlay, {
                  opacity: 0.5,
                  filter: "brightness(1)",
                  duration: 0.3,
                  ease: "power2.inOut",
                });
              }
              if (heroText) {
                gsap.to(heroText, {
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.inOut",
                });
              }
            },
          },
        });

        // 設置初始狀態
        gsap.set(overlay, {
          opacity: 0.5,
          filter: "brightness(1)",
        });
        gsap.set(heroText, {
          opacity: 1,
        });

        return () => {
          tl.kill();
        };
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    };

    // 在路由變化完成後初始化動畫
    const handleRouteChange = () => {
      setTimeout(initAnimation, 100);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // 初始加載時也執行初始化
    if (document.readyState === "complete") {
      initAnimation();
    } else {
      window.addEventListener("load", initAnimation);
    }

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      window.removeEventListener("load", initAnimation);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [router]);

  if (!work) return <div>Loading...</div>;
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="h-[100vh] w-full fixed top-0">
        <div
          className="absolute w-full h-full bg-slate-900 z-20 opacity-50 brightness-100"
          id="hero-overlay"
        ></div>
        {work.fields.mainImage?.fields?.file?.url && (
          <div
            className="absolute mb-8 bg-cover bg-center col-span-3 h-full transition-all duration-500 z-10"
            style={{
              backgroundImage: `url(https:${work.fields.mainImage.fields.file.url})`,
              width: "100%",
              height: "100vh",
            }}
          ></div>
        )}
        <div className="relative md:px-8 px-4 z-20">
          <div
            className="flex flex-col max-w-[80rem] w-full h-[100vh] justify-center gap-4"
            id="text-hero"
          >
            <h1 className="md:text-7xl text-4xl font-bold">
              {work.fields.name}
            </h1>
            <div className="flex flex-row gap-2">
              {Array.isArray(work.fields.type) &&
                work.fields.type.map((categoryRef) => (
                  <span
                    key={categoryRef.sys.id}
                    className="px-[2px] py-[1px] font-thin bg-white text-slate-700 text-lg leading-none uppercase rounded-[2px] "
                  >
                    {categoryRef.fields?.tagName || "Unnamed Category"}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[100vh] w-full relative" id="hero-space"></div>
      <div className="w-full relative md:px-8 px-4 lg:grid lg:grid-cols-8 flex flex-col gap-x-8 z-30">
        {/* 保持原有的flex結構，但為右側內容添加offset */}

        <div className="flex flex-row mt-16 z-[400] col-span-4 col-start-5 mb-[10vh]">
          <div className="left-8 w-[100%]">
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-4 items-start my-[10vh]">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Overview
                </span>
                <div className="text-xl">{work.fields.overview}</div>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Client
                </span>
                <span className="text-xl">{work.fields.client}</span>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Year
                </span>
                <span className="text-xl">
                  {new Date(work.fields.publishDate).getFullYear()}
                </span>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Role
                </span>
                <div className="flex flex-row gap-2 flex-wrap">
                  {Array.isArray(work.fields.role) &&
                    work.fields.role.map((categoryRef, index) => (
                      <React.Fragment key={categoryRef.sys.id}>
                        <span className="text-xl leading-none uppercase">
                          {categoryRef.fields?.roleName || "Unnamed Role"}
                        </span>
                        {index < work.fields.role.length - 1 && (
                          <span className="text-xl leading-none">■</span>
                        )}
                      </React.Fragment>
                    ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Tools
                </span>
                <div className="flex flex-row gap-2 flex-wrap">
                  {Array.isArray(work.fields.toolsUsed) &&
                    work.fields.toolsUsed.map((categoryRef, index) => (
                      <React.Fragment key={categoryRef.sys.id}>
                        <span className="text-xl leading-none uppercase">
                          {categoryRef.fields?.toolName || "Unnamed Role"}
                        </span>
                        {index < work.fields.toolsUsed.length - 1 && (
                          <span className="text-xl leading-none">■</span>
                        )}
                      </React.Fragment>
                    ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Website
                </span>
                <Link
                  className="text-xl"
                  href={`${work.fields.websiteLink}`}
                  target="_blank"
                >
                  View Link
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-8 prose prose-invert max-w-none">
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-y-16 gap-x-8 py-32">
            <div className="w-full col-span-4 col-start-1 overflow-hidden flex aspect-video group">
              {work.fields.imageGallery?.[0]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[0].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[0].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  height={1080}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => setIndex(0)}
                />
              )}
              <div className="absolute top-4 right-4 p-2 flex flex-row">
                <Image
                  src="/assets/search-icon.svg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-8 aspect-square mix-blend-exclusion"
                />
                <div className="group-hover:px-4 text-xl group-hover:w-auto group-hover:opacity-100 opacity-0 w-0 transition-all h-7 overflow-hidden mix-blend-exclusion">
                  <span className="text-nowrap">[Click for the detail]</span>
                </div>
                <div className="absolute w-2 h-2 group-hover:h-4 bg-lime-300 right-0 top-0"></div>
              </div>
            </div>
            <div className="h-full relative col-span-4 col-start-5">
              <div className="flex flex-col sticky top-[20vh]">
                <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Background
                </span>
                {work.fields.backgroundAndChallenges &&
                  documentToReactComponents(
                    work.fields.backgroundAndChallenges,
                    richTextOptions
                  )}
              </div>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-y-16 gap-x-8 lg:py-32 pb-32 pt-0">
            <div className="col-span-3 col-start-1 flex flex-col self-end xl:order-1 order-2">
              <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                Solutions
              </span>
              {work.fields.solution1st &&
                documentToReactComponents(
                  work.fields.solution1st,
                  richTextOptions
                )}
            </div>
            <div className="w-full col-span-3 col-start-4 aspect-video overflow-hidden flex self-start xl:order-2 order-1 group">
              {work.fields.imageGallery?.[1]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[1].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[1].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  height={1080}
                  className="object-cover cursor-pointer"
                  onClick={() => setIndex(1)}
                />
              )}
              <div className="absolute top-4 right-4 p-2 flex flex-row">
                <Image
                  src="/assets/search-icon.svg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-8 aspect-square mix-blend-exclusion"
                />
                <div className="group-hover:px-4 text-xl group-hover:w-auto group-hover:opacity-100 opacity-0 w-0 transition-all h-7 overflow-hidden mix-blend-exclusion">
                  <span className="text-nowrap">[Click for the detail]</span>
                </div>
                <div className="absolute w-2 h-2 group-hover:h-4 bg-lime-300 right-0 top-0"></div>
              </div>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-y-16 gap-x-8 lg:py-32 pb-32 pt-0">
            <div className="w-full col-span-4 col-start-2 aspect-video overflow-hidden flex self-center group">
              {work.fields.imageGallery?.[2]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[2].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[2].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  height={1080}
                  className="object-cover cursor-pointer"
                  onClick={() => setIndex(2)}
                />
              )}
              <div className="absolute top-4 right-4 p-2 flex flex-row">
                <Image
                  src="/assets/search-icon.svg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-8 aspect-square mix-blend-exclusion"
                />
                <div className="group-hover:px-4 text-xl group-hover:w-auto group-hover:opacity-100 opacity-0 w-0 transition-all h-7 overflow-hidden mix-blend-exclusion">
                  <span className="text-nowrap">[Click for the detail]</span>
                </div>
                <div className="absolute w-2 h-2 group-hover:h-4 bg-lime-300 right-0 top-0"></div>
              </div>
            </div>
            <div className="col-span-3 col-start-6 flex flex-col self-end">
              <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                Solutions
              </span>
              {work.fields.solution2nd &&
                documentToReactComponents(
                  work.fields.solution2nd,
                  richTextOptions
                )}
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-y-16 gap-x-8 lg:py-32 pb-32 pt-0">
            <div className="col-span-3 col-start-3 flex flex-col self-end xl:order-1 order-2">
              <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                Solutions
              </span>
              {work.fields.solution3rd &&
                documentToReactComponents(
                  work.fields.solution3rd,
                  richTextOptions
                )}
            </div>
            <div className="w-full col-span-3 col-start-6 aspect-video overflow-hidden flex self-start xl:order-2 order-1 group">
              {work.fields.imageGallery?.[1]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[1].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[1].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  height={1080}
                  className="object-cover w-full h-full  cursor-pointer"
                  onClick={() => setIndex(1)}
                />
              )}
              <div className="absolute top-4 right-4 p-2 flex flex-row">
                <Image
                  src="/assets/search-icon.svg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-8 aspect-square mix-blend-exclusion"
                />
                <div className="group-hover:px-4 text-xl group-hover:w-auto group-hover:opacity-100 opacity-0 w-0 transition-all h-7 overflow-hidden mix-blend-exclusion">
                  <span className="text-nowrap">[Click for the detail]</span>
                </div>
                <div className="absolute w-2 h-2 group-hover:h-4 bg-lime-300 right-0 top-0"></div>
              </div>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-y-16 gap-x-8 lg:py-8 pb-32 pt-0">
            <div className="w-full col-span-4 col-start-1 overflow-hidden flex aspect-video group">
              {work.fields.imageGallery?.[0]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[0].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[0].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => setIndex(0)}
                />
              )}
              <div className="absolute top-4 right-4 p-2 flex flex-row">
                <Image
                  src="/assets/search-icon.svg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="w-8 aspect-square mix-blend-exclusion"
                />
                <div className="group-hover:px-4 text-xl group-hover:w-auto group-hover:opacity-100 opacity-0 w-0 transition-all h-7 overflow-hidden mix-blend-exclusion">
                  <span className="text-nowrap">[Click for the detail]</span>
                </div>
                <div className="absolute w-2 h-2 group-hover:h-4 bg-lime-300 right-0 top-0"></div>
              </div>
            </div>
            <div className="h-full relative col-span-4 col-start-5">
              <div className="flex flex-col sticky top-[30vh]">
                <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Results
                </span>
                {work.fields.results &&
                  documentToReactComponents(
                    work.fields.results,
                    richTextOptions
                  )}
              </div>
            </div>
          </div>
          <div class="lg:grid lg:grid-cols-8 flex flex-col gap-x-8 pb-32 pt-0">
            <NextButton nextProject={nextProject} />
          </div>
        </div>
      </div>
      <Footer />
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Zoom, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        carousel={{
          finite: slides.length <= 1,
        }}
        animation={{ fade: 300 }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, .9)",
          },
          root: {
            "--yarl__color_backdrop": "rgba(0, 0, 0, .9)",
          },
        }}
      />
    </div>
  );
};

export default WorkDetail;
