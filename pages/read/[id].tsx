import React, { useState, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import { Rendition } from "epubjs";
import LensReader from "../../components/reader/LensReader";

const Reader = () => {
  //get teh book data
  //shove it in the lens reader

  return (
    <LensReader
      url={"https://gerhardsletten.github.io/react-reader/files/alice.epub"}
    />
  );
};

export default Reader;
