"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const NextButton = ({ nextProject }) => {
  if (!nextProject) return null; // 如果沒有 nextProject，則不顯示按鈕

  return (
    <Link
      className="col-start-7 col-span-2 flex flex-row p-4 border transition-all bg-slate-100/5 hover:bg-slate-100/10 border-gray-500 items-center gap-4 w-auto justify-between relative group"
      href={`/works/${nextProject.slug}`}
      scroll={false}
      key={nextProject.sys?.id}
    >
      <div className="flex flex-col justify-between h-full">
        <span className="px-[2px] py-[1px] mb-4 text-white text-md leading-none self-start rounded-[2px]">
          Next Project
        </span>
        <span className="text-white text-2xl mb-2">{nextProject.client}</span>
        <div className="flex flex-row gap-2 flex-wrap">
          {Array.isArray(nextProject.type) &&
            nextProject.type.map((categoryRef) => (
              <span
                key={categoryRef.sys?.id}
                className="px-[2px] py-[1px] bg-white text-slate-700 text-sm leading-none uppercase rounded-[2px]"
              >
                {categoryRef.fields?.tagName || "Unnamed Category"}
              </span>
            ))}
        </div>
      </div>

      <div className="relative w-24 aspect-square overflow-hidden">
        {nextProject.mainImage?.fields?.file?.url && (
          <div
            className="absolute bg-cover bg-center h-full transition-all duration-500 z-10 group-hover:scale-110"
            style={{
              backgroundImage: `url(https:${nextProject.mainImage.fields.file.url})`,
              width: "100%",
              height: "100%",
            }}
          ></div>
        )}
      </div>
      <div className="absolute bg-white w-full h-full left-0 top-0 bottom-0 right-0 opacity-10"></div>
    </Link>
  );
};

export default NextButton;
