import { useEffect, useState } from "react";
import { apolloClient } from "../../utils/apollo";
import { gql } from "@apollo/client";
import { useConnect } from "wagmi";

const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;

type Props = {
  url: string;
};

const dev_wallet = "0x2BfC102290Bc92767B290B60fdfeCa120058ECD0";

const LensReader = ({ url }: Props) => {
  const [{ data, error }, connect] = useConnect();

  const [challenge, setChallenge] = useState<any>("");

  const fetchChallenge = async () => {
    let res = await apolloClient.query({
      query: gql(GET_CHALLENGE),
      variables: {
        request: {
          address: dev_wallet,
        },
      },
    });

    console.log("res: ", res);

    if (res) {
      setChallenge(res);
    }
  };

  const signChallenge = async () => {};

  const createProfile = async () => {};

  const createPublication = async () => {};

  const createComment = async () => {};

  const createMirror = async () => {};

  return (
    <div className="mx-10">
      <div>Shit Book but with lens!</div>
      <div>
        {data.connectors.map((connector) => (
          <button
            className="m-2 p-3 bg-pink-400 rounded-md"
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect(connector)}
          >
            {connector.name}
            {!connector.ready && " (unsupported)"}
          </button>
        ))}

        {error && <div>{error?.message ?? "Failed to connect"}</div>}
      </div>
      <div>
        <button
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={fetchChallenge}
        >
          Fetch Challenge
        </button>
        {" "}
        {challenge ? "success" : ""}
      </div>
      <div>
        <button
          className="mt-4 bg-purple-500 rounded-md p-2"
          onClick={signChallenge}
        >
          Sign Challenge
        </button>
        {/* {challenge ? "success" : ""} */}
      </div>
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
