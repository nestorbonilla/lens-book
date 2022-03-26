import React, { useState, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import { Rendition } from "epubjs";
import LensReader from "@components/reader/LensReader";

const Reader = () => {
    //get teh book data
    //shove it in the lens reader


  return (
    // <div style={{ height: "100vh" }}>
      <LensReader url={"https://gerhardsletten.github.io/react-reader/files/alice.epub"}/>

    // </div>
  );
};

export default Reader;
