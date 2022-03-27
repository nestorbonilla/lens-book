/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import Web3Poster from "./web3poster";

type Props = {
  fetchChallenge: () => void;
  connect: () => void;
  challenge: string;
  profiles: any;
  signChallenge: () => void;
  signature: string;
  authToken: string;
  show: boolean;
  hide: () => void;
  fetchProfiles: () => void;
  address: string;
};

export default function Slider({
  fetchChallenge,
  connect,
  address,
  challenge,
  profiles,
  authToken,
  signature,
  signChallenge,
  show,
  hide,
  fetchProfiles,
}: Props) {
  // const [open, setOpen] = useState(true);

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden z-10"
        onClose={hide}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {" "}
                        Panel title{" "}
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={hide}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    {/* Replace with your content */}

                    <div>Shit Book but with lens!</div>
                    <div>
                      <button
                        className="mt-4 bg-purple-500 rounded-md p-2"
                        onClick={connect}
                      >
                        Connect
                      </button>
                      {address ? address : ""}
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
                    <div>
                      <button
                        className="mt-4 bg-purple-500 rounded-md p-2"
                        onClick={fetchProfiles}
                      >
                        Fetch Profiles
                      </button>{" "}
                      {profiles.length > 0 ? "success" : ""}
                    </div>
                    <Web3Poster profile={profiles[0]} />

                    {/* /End replace */}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
