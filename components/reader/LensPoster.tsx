import { createPostTypedData } from "./createPostTypeData";
import {
  useSignTypedData,
  useContract,
  useProvider,
  useSigner,
  useConnect,
} from "wagmi";
import { ethers, Signer, utils } from "ethers";
import LENS_HUB_ABI from "./lenshubabi.json";
import omitDeep from "omit-deep-lodash";
import { useEffect, useState } from "react";
    
//validated by a guy in discord
let LENS_HUB_PROXY_CONTRACT_ADDRESS = "0xd7B3481De00995046C7850bCe9a5196B7605c367";

const LensPoster = ({ profile }: any) => {
  const [{ data }, getSigner] = useSigner();

  const [domain, setDomain] = useState<any>(null);
  const [types, setTypes] = useState<any>(null);
  const [value, setValue] = useState<any>(null);

  const lensHubContract = useContract({
    addressOrName: LENS_HUB_PROXY_CONTRACT_ADDRESS,
    contractInterface: LENS_HUB_ABI,
    signerOrProvider: data,
  });

  const [{ data: signature, error, loading }, signTypedData] = useSignTypedData(
    {
      domain,
      types,
      value,
    }
  );

  const createPost = async () => {
    // await getSigner();

    // hard coded to make the code example clear
    const createPostRequest = {
      profileId: profile.id,
      contentURI: "ipfs://QmPogtffEF3oAbKERsoR4Ky8aTvLgBF5totp5AuF8YN6vl.json",
      collectModule: {
        emptyCollectModule: true,
      },
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };

    const result = await createPostTypedData(createPostRequest);

    console.log("Received result from createPostTypedData");
    console.log(result);

    const typedData = result.data.createPostTypedData.typedData;

    console.log(typedData);
    //unsure if omit deep will work like this
    setValue(omitDeep(typedData.value, "__typename"));
    setTypes(omitDeep(typedData.types, "__typename"));
    setDomain(omitDeep(typedData.domain, "__typename"));
    await getSigner(); 
    await signTypedData();
  };

  const post = async () => {
    if (signature) {
      console.log("Signature: ", signature);

      const { v, r, s } = utils.splitSignature(signature);

      const tx = await lensHubContract.postWithSig({
        profileId: value.profileId,
        contentURI: value.contentURI,
        collectModule: value.collectModule,
        collectModuleData: value.collectModuleData,
        referenceModule: value.referenceModule,
        referenceModuleData: value.referenceModuleData,
        sig: {
          v,
          r,
          s,
          deadline: value.deadline,
        },
      });

      console.log(tx.hash);
    } else {
      console.log("No signature? in post");
    }
  };

  useEffect(() => {
    console.log("Hit sig use effect"); 
    post();
  }, [signature]);

  return (
    <div>
      <button className="bg-green-500 p-3 m-3 rounded-md" onClick={createPost}>
        Create Publication
      </button>
      {/* <SignerIdiot /> */}
    </div>
  );
};

export default LensPoster;
