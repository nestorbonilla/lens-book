import { useEffect, useState } from "react";
import { apolloClient, setGlobalAuthenticationToken } from "../../utils/apollo";
import { gql } from "@apollo/client";
import { useConnect, useAccount, useSignMessage } from "wagmi";
import {
  GET_CHALLENGE,
  AUTHENTICATE,
  FETCH_PROFILES,
  CREATE_PROFILE,
} from "./LensQueries";

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
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });
  const [{ data: signData, error: signError, loading }, signMessage] =
    useSignMessage();

  const isMounted = useIsMounted();
  const [challenge, setChallenge] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [profile, setProfile] = useState<string>("");
  const [profiles, setProfiles] = useState<any[]>([]);

  const fetchChallenge = async () => {
    if (accountData?.address) {
      let res = await apolloClient.query({
        query: gql(GET_CHALLENGE),
        variables: {
          request: {
            address: accountData?.address,
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
      let res = await signMessage({
        message: challenge,
      });
      console.log("res: ", res);

      let signature = res.data;

      if (signature) {
        setSignature(signature);

        let auth_res = await apolloClient.mutate({
          mutation: gql(AUTHENTICATE),
          variables: {
            request: {
              address: accountData?.address,
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
          ownedBy: [accountData?.address],
          limit: 10,
        },
      },
    });

    console.log("Results from fetch profiles");
    console.log(res);

    setProfiles(res.data.profiles.items);
  };

  const createPublication = async () => {
    let variables = {
      profileId: "0x03",
      contentURI: "ipfs://QmPogtffEF3oAbKERsoR4Ky8aTvLgBF5totp5AuF8YN6vl.json",
      collectModule: {
        emptyCollectModule: true,
      },
      referenceModule: {
        followerOnlyReferenceModule: false,
      },
    };
  };

  const createComment = async () => {};

  const createMirror = async () => {};

  return (
    <div className="mx-10">
      <div>Shit Book but with lens!</div>
      <div>
        <>
          {!accountData?.address
            ? data.connectors.map((connector) => (
                <button
                  className="m-2 p-3 bg-pink-400 rounded-md"
                  // disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect(connector)}
                >
                  {isMounted
                    ? connector.name
                    : connector.id === "injected"
                    ? connector.id
                    : connector.name}
                </button>
              ))
            : null}
        </>
        {error && <div>{error?.message ?? "Failed to connect"}</div>}

        <div className="bg-pink-400 p-3 mt-2 rounded-md">{`${accountData?.address}`}</div>
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
          onClick={createPublication}
        >
          Create Publication
        </button>
        {/* {challenge ? "success" : ""} */}
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
    </div>
  );
};

export default LensReader;
