import { useEffect, useState } from "react";
import { apolloClient, setGlobalAuthenticationToken } from "../../utils/apollo";
import { gql } from "@apollo/client";
import { useConnect, useAccount, useSignMessage } from "wagmi";

const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;

const AUTHENTICATE = `
mutation($request: SignedAuthChallenge!) {
  authenticate(request: $request) {
    accessToken
    refreshToken
  }
}`;

const CREATE_PROFILE = `
mutation ($request: CreateProfileRequest!) {
  createProfile(request: $request) {
    ... on RelayerResult {
      txHash
    }
    ... on RelayError {
      reason
    }
    __typename
    }  
}`;

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
  const [prfole, setProfile] = useState<any>(null);
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
    let variables = {
      request: {
        handle: "carlos",
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
    } else {
      console.log("No profile created....");
    }
  };

  const createPublication = async () => {};

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
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={createProfile}
        >
          Create Profile
        </button>
        {/* {challenge ? "success" : ""} */}
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
