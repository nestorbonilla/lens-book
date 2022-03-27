import { useEffect, useState } from "react";
import { apolloClient, setGlobalAuthenticationToken } from "../../utils/apollo";
import { gql } from "@apollo/client";
import { ethers, utils } from "ethers";
// import { useConnect, useAccount, useSignMessage } from "wagmi";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  GET_CHALLENGE,
  AUTHENTICATE,
  FETCH_PROFILES,
  CREATE_PROFILE,
} from "./LensQueries";
// const alchemyId = process.env.ALCHEMY_KEY
import Web3Modal from "web3modal";

import Web3Poster from "./web3poster";

type Props = {
  url: string;
};

// const providerOptions = {
//   walletconnect: {
//     package: WalletConnectProvider,
//     options: {
//       rpc: {
//         1: process.env.ALCHEMY_RPC_URL ? process.env.ALCHEMY_RPC_URL : "",
//       },
//       qrcode: true,
//     },
//   },
// };

export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    console.log("Mounted");
  }, []);

  return mounted;
};

const LOCAL_LENS_PROFILE = "lensbook_profile";

const LensReader = ({ url }: Props) => {
  const isMounted = useIsMounted();
  const [address, setAddress] = useState<string>("");
  const [challenge, setChallenge] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [profile, setProfile] = useState<string>("");
  const [profiles, setProfiles] = useState<any[]>([]);

  const connect = async () => {
   
    const web3Modal = new Web3Modal();

    const instance = await web3Modal.connect();

    console.log("Connected to web3", instance);

    const provider = new ethers.providers.Web3Provider(instance);

    let address = await provider.getSigner().getAddress();
    console.log("Address got", address);
    setAddress(address);
  };

  const fetchChallenge = async () => {
    if (address) {
      let res = await apolloClient.query({
        query: gql(GET_CHALLENGE),
        variables: {
          request: {
            address: address,
          },
        },
      });

      if (res) {
        let text = res.data.challenge.text;
        console.log(text);
        setChallenge(text);
      }
    } else {
      alert("Please connect wallet");
    }
  };

  //hydrate
  useEffect(() => {
    if (window.localStorage) {
      let previousState = window.localStorage.getItem(LOCAL_LENS_PROFILE);
      if (previousState) {
        console.log("Hydrationg state" + previousState);
        setProfile(previousState);
      }
    }
  }, []);

  const signChallenge = async () => {
    if (challenge) {
      const web3Modal = new Web3Modal();

      const instance = await web3Modal.connect();

      console.log("Connected to web3", instance);

      const provider = new ethers.providers.Web3Provider(instance);

      let res = await provider.getSigner().signMessage(challenge);

      // let res = await signMessage({
      //   message: challenge,
      // });

      console.log("res: ", res);

      let signature = res; 

      if (signature) {
        setSignature(signature);

        let auth_res = await apolloClient.mutate({
          mutation: gql(AUTHENTICATE),
          variables: {
            request: {
              address: address,
              signature: signature,
            },
          },
        });

        console.log("auth_res: ", auth_res);

        setAuthToken(auth_res.data.authenticate.accessToken);
        setGlobalAuthenticationToken(auth_res.data.authenticate.accessToken);
        setRefreshToken(auth_res.data.authenticate.refreshToken);
      } else {
        console.log("No signiture....");
      }
    }
  };

  const createProfile = async () => {
    if (!profile) {
      let variables = {
        request: {
          handle: "carloss",
          profilePictureUri: `https://pbs.twimg.com/profile_images/1380979602076667904/7NIW3Cyt_400x400.jpg`,
          followNFTURI: null,
          followModule: null,
        },
      };

      let res = await apolloClient.mutate({
        mutation: gql(CREATE_PROFILE),
        variables,
      });

      if (res) {
        console.log("Profile created: ", res);
        setProfile(res.data);
        window.localStorage.setItem(LOCAL_LENS_PROFILE, res.data);
      } else {
        console.log("No profile created....");
      }
    } else {
      alert("We already have a profiel");
    }
  };

  const fetchProfiles = async () => {
    let res = await apolloClient.query({
      query: gql(FETCH_PROFILES),
      variables: {
        request: {
          ownedBy: [address],
          limit: 10,
        },
      },
    });

    console.log("Results from fetch profiles");
    console.log(res);

    setProfiles(res.data.profiles.items);
  };

  const createComment = async () => {};

  const createMirror = async () => {};

  return (
    <div className="mx-10">
      <div>Shit Book but with lens!</div>
      <div>
        <button className="mt-4 bg-purple-500 rounded-md p-2" onClick={connect}>
          Connect
        </button>
      </div>
      <div>
        <button
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={fetchChallenge}
        >
          Fetch Challenge
        </button>{" "}
        {challenge ? "success" : ""}
      </div>
      <div>
        <button
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={signChallenge}
        >
          Sign Challenge
        </button>{" "}
        {signature && authToken ? "success" : ""}
      </div>

      {/* <div>
        <button // do some other day. or never. 
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={refreshToken}
        >
          Refresh Token
        </button>
        {challenge ? "success" : ""}
      </div> */}
      <div>
        <button
          disabled={!!profile}
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={createProfile}
        >
          Create Profile
        </button>
        {!!profile ? "created" : ""}
      </div>
      <div>
        <button
          // disabled={!!profile}
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={fetchProfiles}
        >
          Fetch Profiles
        </button>
        {/* {!!profile ? "created" : ""} */}
      </div>
      
      <div>
        <button
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={createComment}
        >
          Create Comment
        </button>
        {/* {challenge ? "success" : ""} */}
      </div>
      <div>
        <button
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={createMirror}
        >
          Create Mirror
        </button>
        {/* {challenge ? "success" : ""} */}
       
      </div>
      <Web3Poster profile={profiles[0]} />
    </div>
  );
};

export default LensReader;
