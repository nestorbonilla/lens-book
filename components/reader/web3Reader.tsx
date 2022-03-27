import { useEffect, useState, useRef } from "react";
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
import { Rendition } from "epubjs";
import Web3Poster from "./web3poster";
import Slider from "./slider";
import { ReactReader } from "react-reader";
import { v4 as uuid } from "uuid";

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

export interface Highlight {
  text: string;
  cfiRange: string;
  local_id: string; //create for local reading experience to work offline
  supabase_annotation_id?: string;
  persisted: boolean;
  user_id?: string; //jwt / wallet / something at some point.
  objectId?: string;
  bookId?: string; // either an ERC1155 or ERC721 token ID
  notes?: string;
  chapter?: {
    href: string;
    label: string;
  };
}

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
  //one current highlight
  const [highlightText, setHighlightText] = useState<string>("");
  //all highlights
  const [highlights, setHighlights] = useState<Map<string, Highlight>>(
    new Map<string, Highlight>()
  );
  const [epubRendered, setEpubRendered] = useState<boolean>(false);

  // And your own state logic to persist state
  const [location, setLocation] = useState<string | number | undefined>();

  //rendition is epubjs stuff
  const renditionRef = useRef<Rendition>();
  const tocRef = useRef<any>();

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

  function getRendition(rendition: Rendition) {
    console.log("Hit Rendition");
    // console.log(rendition);

    renditionRef.current = rendition;
    renditionRef.current.themes.default({
      "::selection": {
        background: "pink",
      },
    });

    setEpubRendered(true);
  }

  //book order matters not when they where highlighted. Order by cfiRange?
  const saveHighlight = async (cfiRange: string, contents: any) => {
    try {
      //update local state
      let local_id = uuid();

      let highlight: Highlight = {
        local_id,
        text: renditionRef.current!.getRange(cfiRange).toString(),
        cfiRange,
        persisted: false,
      };

      //update local state
      setHighlights((prev) => new Map(prev).set(local_id, highlight));

      //update epub ( local non persistent highlighs added )
      saveHighlightToEpub(cfiRange, contents);

      //add to LENS PROTOCOL!
      setOpen(true);
      setHighlightText(highlight.text);
      setCfiRange(highlight.cfiRange);
      // setChapter(highlight.chapter?.label);
      // let serverHighlight = await saveHighlightToSupabase(highlight);
      //TODO: do it.

      //update loading state of highlight from supabase
      setHighlights((prev) =>
        new Map(prev).set(local_id, { ...highlight, persisted: true })
      );
    } catch (e) {
      alert("Add Highlight Failed" + (e as Error).message);
    }
  };

  const saveHighlightToEpub = (cfiRange: string, contents: any) => {
    if (renditionRef.current) {
      //adds the highlight to the rendition. gone between page refresh.
      renditionRef.current.annotations.add(
        "highlight",
        cfiRange,
        {},
        undefined,
        "hl",
        { fill: "pink", "fill-opacity": "0.5", "mix-blend-mode": "multiply" }
      );
      //this removes like the native highlight as we apply the state managed one
      contents.window.getSelection().removeAllRanges();
    } else {
      console.log("No rendition for save Highlight");
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <ReactReader
        location={location}
        locationChanged={(arg) => setLocation(arg)}
        url={"https://gerhardsletten.github.io/react-reader/files/alice.epub"}
        getRendition={getRendition}
        epubInitOptions={{ openAs: "epub" }}
        tocChanged={(toc) => (tocRef.current = toc)}
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
