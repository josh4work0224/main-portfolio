import React, { useEffect, useState } from "react";
import { createClient } from "contentful";
import WorkSlider from "./WorkSlider";

const FeaturedWorks = () => {
  const [works, setWorks] = useState([]);

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
        "fields.featured": true,
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
      })
      .catch(console.error);
  }, []);

  return (
    <div className="relative">
      <WorkSlider works={works} />
    </div>
  );
};

export default FeaturedWorks;
