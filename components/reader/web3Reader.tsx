import { useEffect, useState } from "react";
import { apolloClient, setGlobalAuthenticationToken } from "../../utils/apollo";
import { gql } from "@apollo/client";
import { ethers } from "ethers";
import {
  GET_CHALLENGE,
  AUTHENTICATE,
  FETCH_PROFILES,
  CREATE_PROFILE,
} from "./LensQueries";
// const alchemyId = process.env.ALCHEMY_KEY
import Web3Modal from "web3modal";
import { MenuIcon } from "@heroicons/react/outline";

import Web3Poster from "./web3poster";
import Slider from "./slider";
import { ReactReader } from "react-reader";

type Props = {
  url: string;
};

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
  const [open, setOpen] = useState(false);
  const [cfiRange, setCfiRange] = useState<string>("");
  const [highlightText, setHighlightText] = useState<string>("");

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


  return (
    <div style={{ height: "100vh" }}>
      <ReactReader
        url={"https://gerhardsletten.github.io/react-reader/files/alice.epub"}
      />
       {!open && (
        <button
          type="button"
          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
          onClick={() => setOpen(true)}
        >
          <MenuIcon
            className="h-6 w-6"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 100,
            }}
          />
        </button>
      )}
      <Slider
       address={address}
        connect={connect}
        show={open}
        hide={() => setOpen(false)}
        challenge={challenge}
        fetchChallenge={fetchChallenge}
        profiles={profiles}
        signChallenge={signChallenge}
        signature={signature}
        authToken={authToken}
        fetchProfiles={fetchProfiles}
        highlightText={highlightText}
        cfiRange={cfiRange}
      />
    </div>
  );
};

export default LensReader;
