import React, { useState, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import { Rendition } from "epubjs";
import Web3Reader from "../../components/reader/web3Reader";

const Reader = () => {
    //trying this all agian with web3modal.. 
  //get teh book data
  //shove it in the lens reader

  return (
    <Web3Reader
      url={"https://gerhardsletten.github.io/react-reader/files/alice.epub"}
    />
  );
};

export default Reader;
