import React from "react";
// import { createClient } from "contentful";
import WorkSlider from "./WorkSlider";

const FeaturedWorks = ({ works }) => {
  return (
    <div className="relative">
      <WorkSlider works={works} />
    </div>
  );
};

export default FeaturedWorks;
