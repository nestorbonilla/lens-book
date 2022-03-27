import { useEffect, useState } from "react";
import { createPostTypedData } from "./createPostTypeData";
import { ethers, Signer, utils } from "ethers";
import Web3Modal from "web3modal";
import LENS_HUB_ABI from "./lenshubabi.json";
import * as omitDeep from "omit-deep-lodash";
import { v4 as uuid } from "uuid";

//validated by a guy in discord
let LENS_HUB_PROXY_CONTRACT_ADDRESS =
  "0xd7B3481De00995046C7850bCe9a5196B7605c367";

const LensPoster = ({ profile, highlightText, cfiRange }) => {
  let [txnHash, setTxnHash] = useState("");

  const createPinata = async () => {
    let metadata = {
      version: "1.0.0",
      name: "Highlight In Book",
      description: "Highlight text imo",
      metadata_id: uuid(),
      content: highlightText,
      attributes: [
        {
          displayType: "string",
          traitType: "book",
          value: "Alice in Thunderdome",
        },
        {
          displayType: "string",
          traitType: "chapter",
          value: "2",
        },
        {
          displayType: "string",
          traitType: "cfiRange",
          value: cfiRange,
        },
        {
          displayType: "string",
          traitType: "quote",
          value: highlightText,
        },

        {
          displayType: "string",
          traitType: "author",
          value: "Jane Doe",
        },
      ],
    };

    console.log("Metadata");
    console.log(metadata);

    // 4.2 elaborate pinata options
    const options = {
      pinataMetadata: {
        name: "book_derp",
      },
    };

    //make pinata metadata
    const { ipfsHash } = await fetch("/api/pinata", {
      method: "POST",
      body: JSON.stringify({ metadata, options }),
    }).then((response) => response.json());

    console.log("nft metadata: ", ipfsHash);

    return ipfsHash;
  };

  const createPost = async () => {
    let hash = await createPinata();

    // hard coded to make the code example clear
    const createPostRequest = {
      profileId: profile.id,
      contentURI: `ipfs://${hash}.json`,
      collectModule: {
        emptyCollectModule: true,
      },
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };

    console.log("CraetePostRequest");
    console.log(createPostRequest);

    const result = await createPostTypedData(createPostRequest);

    console.log("Received result from createPostTypedData");

    const typedData = result.data.createPostTypedData.typedData;

    console.log("Result from createPostTypedData");
    console.log(typedData);

    let domain = omitDeep(typedData.domain, "__typename");
    let types = omitDeep(typedData.types, "__typename");
    let value = omitDeep(typedData.value, "__typename");

    const web3Modal = new Web3Modal();

    const instance = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(instance);

    let signer = provider.getSigner();

    let signature = await signer._signTypedData(domain, types, value);

    const { v, r, s } = utils.splitSignature(signature);

    const lensHub = new ethers.Contract(
      LENS_HUB_PROXY_CONTRACT_ADDRESS,
      LENS_HUB_ABI,
      signer
    );

    const tx = await lensHub.postWithSig({
      profileId: typedData.value.profileId,
      contentURI: typedData.value.contentURI,
      collectModule: typedData.value.collectModule,
      collectModuleData: typedData.value.collectModuleData,
      referenceModule: typedData.value.referenceModule,
      referenceModuleData: typedData.value.referenceModuleData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    });

    console.log(tx.hash);
    setTxnHash(tx.hash);
  };

  return (
    <div>
      <button className="bg-green-500 p-3 m-3 rounded-md" onClick={createPost}>
        Create Publication
      </button>
      {txnHash ? txnHash : ""}
    </div>
  );
};

export default LensPoster;
