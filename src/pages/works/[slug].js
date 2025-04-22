import { createClient } from "contentful";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
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
import DetailImageSlider from "@/components/DetailGallery";

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
      <h1 className="text-4xl mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl mb-3">{children}</h3>
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

  // 提取所有需要在 Lightbox 中显示的图片
  const allImages = useMemo(() => {
    const mainImages = work?.fields?.imageGallery || [];
    const detailImages = work?.fields?.detailImages || []; // 假设您有一个名为 detailImages 的字段用于轮播图

    // 组合所有图片，先是主要展示的图片，然后是详细图片
    return [...mainImages, ...detailImages];
  }, [work?.fields?.imageGallery, work?.fields?.detailImages]);

  // 创建 Lightbox 所需的幻灯片数据
  const slides = useMemo(() => {
    return allImages.map((image) => ({
      src: `https:${image.fields.file.url}`,
      alt: image.fields.file.title || "Gallery image",
      width: 1920,
      height: 1080,
    }));
  }, [allImages]);

  // 处理详细图片点击，传入对应的索引偏移量
  const handleDetailImageClick = (detailIndex) => {
    // 主要展示图片的数量
    const mainImagesCount = work?.fields?.imageGallery?.length || 0;
    // 详细图片在 Lightbox 中的起始索引应该是主要图片之后
    setIndex(mainImagesCount + detailIndex);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);
    console.log("ScrollTrigger registered");

    const initAnimation = () => {
      // 清理所有現有的 ScrollTrigger 實例
      ScrollTrigger.getAll().forEach((st) => st.kill());
      ScrollTrigger.clearMatchMedia();
      ScrollTrigger.refresh(true);

      const overlay = document.querySelector("#hero-overlay");
      const heroProject = document.querySelector("#hero-space");
      const heroText = document.querySelector("#text-hero");

      console.log("Attempting to find elements:", {
        overlay: !!overlay,
        heroProject: !!heroProject,
        heroText: !!heroText,
      });

      if (!overlay || !heroProject || !heroText) {
        console.log("Elements not found, retrying...");
        return setTimeout(initAnimation, 100);
      }

      console.log("Elements found, creating ScrollTrigger");

      // 設置初始狀態
      gsap.set(overlay, { opacity: 0.5, filter: "brightness(1)" });
      gsap.set(heroText, { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroProject,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onEnter: () => {
            console.log("ScrollTrigger: Enter");
            gsap.to(overlay, {
              opacity: 0.85,
              filter: "brightness(0.2)",
              duration: 0.3,
            });
            gsap.to(heroText, {
              opacity: 0,
              duration: 0.3,
            });
          },
          onLeaveBack: () => {
            console.log("ScrollTrigger: Leave Back");
            gsap.to(overlay, {
              opacity: 0.5,
              filter: "brightness(1)",
              duration: 0.3,
            });
            gsap.to(heroText, {
              opacity: 1,
              duration: 0.3,
            });
          },
        },
      });

      return () => {
        console.log("Cleaning up timeline");
        tl.kill();
      };
    };

    // 監聽頁面轉場完成事件
    const handleTransitionComplete = () => {
      console.log("Page transition complete, initializing ScrollTrigger");
      initAnimation();
    };

    // 添加事件監聽器
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    // 初始加載時也需要初始化
    if (document.readyState === "complete") {
      initAnimation();
    } else {
      window.addEventListener("load", initAnimation);
    }

    // 清理函數
    return () => {
      console.log("Component cleanup");
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
      window.removeEventListener("load", initAnimation);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []); // 移除 router.asPath 依賴，只在組件掛載和收到 pageTransitionComplete 事件時初始化

  // 添加一個額外的 useEffect 來在組件卸載時清理 ScrollTrigger 實例
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up ScrollTrigger");
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  if (!work) return <div>Loading...</div>;
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="h-[100dvh] w-full fixed top-0">
        <div
          className="absolute w-full h-full bg-slate-900 z-20 opacity-50 brightness-100"
          id="hero-overlay"
        ></div>
        {work.fields.mainImage?.fields?.file?.url && (
          <div className="absolute w-full h-full z-10">
            <Image
              src={`https:${work.fields.mainImage.fields.file.url}`}
              alt={work.fields.mainImage.fields.file.title || "Hero image"}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="relative md:px-8 px-4 z-20">
          <div
            className="flex flex-col max-w-[80rem] w-full h-[100vh] justify-center gap-4"
            id="text-hero"
          >
            <h1 className="md:text-7xl text-4xl">{work.fields.name}</h1>
            <div className="flex flex-row gap-2">
              {Array.isArray(work.fields.type) &&
                work.fields.type.map((categoryRef) => (
                  <span
                    key={categoryRef.sys.id}
                    className="px-[2px] py-[1px] font-thin bg-white text-slate-700 text-lg leading-none uppercase rounded-[2px]"
                  >
                    {categoryRef.fields?.tagName || "Unnamed Category"}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[100dvh] w-full relative" id="hero-space"></div>
      <div className="w-full relative md:px-8 px-4 lg:grid lg:grid-cols-8 flex flex-col gap-x-8 z-30">
        {/* 保持原有的flex結構，但為右側內容添加offset */}

        <div className="flex flex-row mt-16 z-[400] col-span-4 col-start-5 mb-[10vh]">
          <div className="left-8 w-[100%]">
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-4 items-start my-[10vh]">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Overview
                </span>
                {work.fields.summary &&
                  documentToReactComponents(
                    work.fields.summary,
                    richTextOptions
                  )}
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Client
                </span>
                <span className="text-lg">{work.fields.client}</span>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <span className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                  Year
                </span>
                <span className="text-lg">
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
                        <span className="text-lg uppercase">
                          {categoryRef.fields?.roleName || "Unnamed Role"}
                        </span>
                        {index < work.fields.role.length - 1 && (
                          <span className="text-lg">■</span>
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
                        <span className="text-lg uppercase">
                          {categoryRef.fields?.toolName || "Unnamed Role"}
                        </span>
                        {index < work.fields.toolsUsed.length - 1 && (
                          <span className="text-lg">■</span>
                        )}
                      </React.Fragment>
                    ))}
                </div>
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
                  alt="search-icon"
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
            <div className="col-span-3 col-start-1 flex flex-col self-end lg:order-1 order-2">
              <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                Solutions
              </span>
              {work.fields.solution1st &&
                documentToReactComponents(
                  work.fields.solution1st,
                  richTextOptions
                )}
            </div>
            <div className="w-full col-span-3 col-start-4 aspect-video overflow-hidden flex self-start lg:order-2 order-1 group">
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
            <div className="col-span-3 col-start-3 flex flex-col self-end lg:order-1 order-2">
              <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                Solutions
              </span>
              {work.fields.solution3rd &&
                documentToReactComponents(
                  work.fields.solution3rd,
                  richTextOptions
                )}
            </div>
            <div className="w-full col-span-3 col-start-6 aspect-video overflow-hidden flex self-start lg:order-2 order-1 group">
              {work.fields.imageGallery?.[3]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[3].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[3].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  height={1080}
                  className="object-cover w-full h-full  cursor-pointer"
                  onClick={() => setIndex(3)}
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
              {work.fields.imageGallery?.[4]?.fields?.file?.url && (
                <PixelatedImage
                  src={`https:${work.fields.imageGallery[4].fields.file.url}`}
                  alt={
                    work.fields.imageGallery[4].fields.file.title ||
                    "Gallery image"
                  }
                  width={1920}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => setIndex(4)}
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
            <div className="col-span-4 col-start-5 flex flex-col self-end lg:order-1 order-2">
              <span className="px-[2px] py-[1px] mb-4 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]">
                Results
              </span>
              {work.fields.results &&
                documentToReactComponents(work.fields.results, richTextOptions)}
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-x-8 pb-8 pt-0">
            <div className="col-span-8">
              {/* 添加详细图片滑动组件 */}
              {work?.fields?.detailImages &&
              work.fields.detailImages.length > 0 ? (
                <DetailImageSlider
                  images={work.fields.detailImages}
                  onImageClick={handleDetailImageClick}
                />
              ) : work?.fields?.imageGallery &&
                work.fields.imageGallery.length > 5 ? (
                // 如果没有专门的 detailImages 字段，可以使用 imageGallery 中未在页面上显示的图片
                <DetailImageSlider
                  images={work.fields.imageGallery.slice(5)}
                  onImageClick={(i) => setIndex(5 + i)}
                />
              ) : null}
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-8 flex flex-col gap-x-8 pb-32 pt-0">
            <NextButton nextProject={nextProject} />
          </div>
        </div>
      </div>
      <Footer />
      {work.fields.websiteLink && (
        <Link
          href={work.fields.websiteLink}
          target="_blank"
          className="fixed bottom-8 left-8 z-50 text-white
          transition-all flex items-end gap-2 group mix-blend-difference"
        >
          <h4 className="text-2xl leading-none">Live Site</h4>
          <div className="relative w-[2rem] h-[2rem] overflow-hidden">
            <svg
              width="32"
              height="32"
              viewBox="0 0 243 242"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute transform group-hover:-translate-y-8 group-hover:translate-x-8 transition-transform duration-300 ease-in-out"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M140.745 95.0575L35 199.944L41.123 206L146.855 101.126L146.923 179.837L155.576 179.83L155.5 92.551L156 92.0556L155.5 91.5607L155.495 86.4999L150.378 86.4956L149.877 86L149.378 86.4947L61.2638 86.4199L61.2564 94.99L140.745 95.0575Z"
                fill="currentColor"
                strokeWidth="2"
              />
              <rect x="156" y="36" width="50" height="50" fill="#BEF264" />
            </svg>
            <svg
              width="32"
              height="32"
              viewBox="0 0 243 242"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute transform translate-y-8 -translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-300 ease-in-out"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M140.745 95.0575L35 199.944L41.123 206L146.855 101.126L146.923 179.837L155.576 179.83L155.5 92.551L156 92.0556L155.5 91.5607L155.495 86.4999L150.378 86.4956L149.877 86L149.378 86.4947L61.2638 86.4199L61.2564 94.99L140.745 95.0575Z"
                fill="currentColor"
                strokeWidth="2"
              />
              <rect x="156" y="36" width="50" height="50" fill="#BEF264" />
            </svg>
          </div>
        </Link>
      )}
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
