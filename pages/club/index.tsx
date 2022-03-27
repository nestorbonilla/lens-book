import { useState, useEffect } from "react";
import { GET_PUBLICATIONS } from "../../components/reader/LensQueries";
import { apolloClient, setGlobalAuthenticationToken } from "../../utils/apollo";
import { gql } from "@apollo/client";

const Post = ({ post }: { post: any }) => {
  return (
    <div className="flex mt-2 border border-grey-light-alt hover:border-grey rounded bg-white cursor-pointer">
      <div className="w-1/12 flex flex-col text-center pt-2">
        <button className="text-xs">
          <svg
            className="w-5 fill-current text-grey"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M7 10v8h6v-8h5l-8-8-8 8h5z" />
          </svg>
        </button>
        <span className="text-xs font-semibold my-1">20k</span>
        <button className="text-xs">
          <svg
            className="w-5 fill-current text-grey"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M7 10V2h6v8h5l-8 8-8-8h5z" />
          </svg>
        </button>
      </div>

      <div className="w-11/12 pt-2">
        <div className="flex items-center text-xs mb-2">
          <a
            href="#"
            className="font-semibold no-underline hover:underline text-black flex items-center"
          >
            <span className="ml-2">r/tailwind</span>
          </a>
          <span className="text-grey-light mx-1 text-xxs">•</span>
          <span className="text-grey">Posted by</span>
          <a href="#" className="text-grey mx-1 no-underline hover:underline">
            u/TestUser
          </a>
          <span className="text-grey">2 hours ago</span>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-1">
            {post.metadata.attributes[3].value}
          </h2>
        </div>
        <div className="inline-flex items-center my-1">
          <div className="flex hover:bg-grey-lighter p-1">
            <svg
              className="w-4 fill-current text-grey"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-4 4v-4H2a2 2 0 0 1-2-2V3c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8zM5 7v2h2V7H5zm4 0v2h2V7H9zm4 0v2h2V7h-2z" />
            </svg>
            <span className="ml-2 text-xs font-semibold text-grey">
              3k Comments
            </span>
          </div>
          <div className="flex hover:bg-grey-lighter p-1 ml-2">
            <svg
              className="w-4 fill-current text-grey"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.08 12.16A2.99 2.99 0 0 1 0 10a3 3 0 0 1 5.08-2.16l8.94-4.47a3 3 0 1 1 .9 1.79L5.98 9.63a3.03 3.03 0 0 1 0 .74l8.94 4.47A2.99 2.99 0 0 1 20 17a3 3 0 1 1-5.98-.37l-8.94-4.47z" />
            </svg>
            <span className="ml-2 text-xs font-semibold text-grey">Share</span>
          </div>
          <div className="flex hover:bg-grey-lighter p-1 ml-2">
            <svg
              className="w-4 fill-current text-grey"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M0 2C0 .9.9 0 2 0h14l4 4v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm5 0v6h10V2H5zm6 1h3v4h-3V3z" />
            </svg>
            <span className="ml-2 text-xs font-semibold text-grey">Save</span>
          </div>
          <div className="flex hover:bg-grey-lighter p-1 ml-2 rotate-90">
            <svg
              className="w-4 fill-current text-grey"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const club = ({}) => {
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    let res = await apolloClient.query({
      query: gql(GET_PUBLICATIONS),
      variables: {
        request: {
          profileId: "0x03b5", // or 0x03a8
          publicationTypes: ["POST", "COMMENT", "MIRROR"],
        },
      },
    });

    if (res) {
      // let text = res.data.challenge.text;
      console.log(res);
      setPosts(res.data.publications.items);
    } else {
      console.log("No Posts!");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex bg-blue-lightest flex-col font-sans">
      <div className="mt-12">
        <div className="bg-white mb-3">
          <div className="container mx-auto">
            <div className="flex w-960 mx-auto">
              <div className=" py-2">
                <div className="inline-flex items-center mr-6">
                  <div className="text-xxs text-grey font-semibold mr-4">
                    VIEW
                  </div>
                  <div>
                    <button>
                      <svg
                        className="h-5 fill-current text-blue"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="inherit"
                          d="M1.75,9.375 L1.75,1.75 L18.25,1.75 L18.25,9.375 L1.75,9.375 Z M1.75,18.25 L1.75,10.625 L18.25,10.625 L18.25,18.25 L1.75,18.25 Z"
                        ></path>
                      </svg>
                    </button>
                    <button>
                      <svg
                        className="h-5 fill-current text-blue opacity-25"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="inherit"
                          d="M1.75,6.60294118 L1.75,1.75 L18.25,1.75 L18.25,6.60294118 L1.75,6.60294118 Z M1.75,12.4264706 L1.75,7.57352941 L18.25,7.57352941 L18.25,12.4264706 L1.75,12.4264706 Z M1.75,18.25 L1.75,13.3970588 L18.25,13.3970588 L18.25,18.25 L1.75,18.25 Z"
                        ></path>
                      </svg>
                    </button>
                    <button>
                      <svg
                        className="h-5 fill-current text-blue opacity-25"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="inherit"
                          d="M1.75,4.95149254 L1.75,1.75 L18.25,1.75 L18.25,4.95149254 L1.75,4.95149254 Z M1.75,9.38432836 L1.75,6.18283582 L18.25,6.18283582 L18.25,9.38432836 L1.75,9.38432836 Z M1.75,18.25 L1.75,15.0485075 L18.25,15.0485075 L18.25,18.25 L1.75,18.25 Z M1.75,13.8171642 L1.75,10.6156716 L18.25,10.6156716 L18.25,13.8171642 L1.75,13.8171642 Z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="inline-flex items-center">
                  <div className="text-xxs text-grey font-semibold mr-4">
                    SORT
                  </div>
                  <div className="inline-flex items-center">
                    <button className="inline-flex items-center">
                      <svg
                        className="h-4 fill-current text-blue"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <title>Hot</title>
                        <path d="M10.31.61a.5.5,0,0,0-.61,0C9.41.83,2.75,6.07,2.75,11.47a8.77,8.77,0,0,0,3.14,6.91.5.5,0,0,0,.75-.64,3.84,3.84,0,0,1-.55-2A7.2,7.2,0,0,1,10,9.56a7.2,7.2,0,0,1,3.91,6.23,3.84,3.84,0,0,1-.55,2,.5.5,0,0,0,.75.64,8.77,8.77,0,0,0,3.14-6.91C17.25,6.07,10.59.83,10.31.61Z"></path>
                      </svg>
                      <span className="text-blue text-xs font-semibold ml-1 mr-2">
                        HOT
                      </span>
                      <svg
                        className="h-4 fill-current text-blue"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <path
                            fill="inherit"
                            d="M14.1711599,9.3535 L9.99925636,13.529 L5.82735283,9.3535 C5.51262415,9.0385 5.73543207,8.5 6.18054835,8.5 L13.8179644,8.5 C14.2630807,8.5 14.4858886,9.0385 14.1711599,9.3535"
                          ></path>
                        </g>
                      </svg>
                    </button>
                    <button className="inline-flex items-center ml-3">
                      <span className="text-blue text-xs font-semibold ml-1 mr-2">
                        EVERYWHERE
                      </span>
                      <svg
                        className="h-4 fill-current text-blue"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <path
                            fill="inherit"
                            d="M14.1711599,9.3535 L9.99925636,13.529 L5.82735283,9.3535 C5.51262415,9.0385 5.73543207,8.5 6.18054835,8.5 L13.8179644,8.5 C14.2630807,8.5 14.4858886,9.0385 14.1711599,9.3535"
                          ></path>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-1/3">&nbsp;</div>
            </div>
          </div>
        </div>
        <div className="container mx-auto">
          <div className="flex w-960 mx-auto">
            <div className="">
              <div className="py-2">
                {/* component? */}
                {posts.map((post, index) => {
                  return <Post key={index} post={post} />;
                })}
                {/* end component */}
              </div>
            </div>
            {/* <div className="w-1/3 ml-5">
						<div className="py-2">
							<div className="rounded bg-white mb-4">
								<div className="p-3">
									<div className="h-8 -m-3 bg-no-repeat bg-100%">
									</div>
									<div>
										<div className="inline-flex items-center">
											
											<span className="text-lg ml-4 mt-6">r/popular</span>
										</div>
										<p className="font-normal mb-3 text-sm leading-normal">The best posts on Reddit for you, pulled from the most active communities on Reddit. Check here to see the most shared, upvoted, and commented content on the internet.</p>
										<button className="bg-blue-dark text-sm text-white font-semibold rounded px-4 py-2 w-full">CREATE POST</button>
									</div>
								</div>
							</div>
							<div className="rounded bg-white mb-4">
								<div className="p-2">
									<div className="flex items-center">
										<svg className="h-6 w-6 mr-4 text-orange fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Reddit Premium</title><path d="M13.535 15.785c-1.678.244-2.883.742-3.535 1.071v-5.113a2 2 0 0 0-2-2H4.217c.044-.487.076-1.016.076-1.629 0-1.692-.489-2.968-.884-3.722L4.8 3.001H10v4.742a2 2 0 0 0 2 2h3.783c.06.67.144 1.248.22 1.742.097.632.182 1.177.182 1.745 0 1.045-.829 2.291-2.65 2.555m5.028-12.249l-2.242-2.242a1 1 0 0 0-.707-.293H4.386a1 1 0 0 0-.707.293L1.436 3.536a1 1 0 0 0-.069 1.337c.009.011.926 1.2.926 3.241 0 1.304-.145 2.24-.273 3.065-.106.684-.206 1.33-.206 2.051 0 1.939 1.499 4.119 4.364 4.534 2.086.304 3.254 1.062 3.261 1.065a1.016 1.016 0 0 0 1.117.004c.011-.007 1.18-.765 3.266-1.069 2.864-.415 4.363-2.595 4.363-4.534 0-.721-.099-1.367-.206-2.051-.128-.825-.272-1.761-.272-3.065 0-2.033.893-3.199.926-3.241a.999.999 0 0 0-.07-1.337"></path></svg>
										<div className="flex flex-col">
							 				<span className="text-xs font-medium text-black-alt mb-1">Reddit Premium</span>
											<span className="text-xxs font-normal">Ads-free browsing</span>
										</div>
										<div className="flex ml-auto">
											<button className="bg-orange text-xs text-white font-semibold rounded px-4 py-2 ml-auto">GET PREMIUM</button>
										</div>
									</div>
								</div>
							</div>
							<div className="rounded bg-white mb-4">
								<div className="p-3 text-xxs font-semibold w-full">TRENDING COMMUNITIES</div>
								<div className="pb-4">
									<div className="px-3 py-2">
										<div className="flex">
											
											<div className="flex flex-col font-medium">
												<a href="#" className="text-xs text-black-alt no-underline leading-tight">r/tailwind</a>
												<span className="text-xxs">1.000 subscribers</span>
											</div>
											<div className="flex ml-auto">
												<button className="bg-blue-dark text-xs text-white font-semibold rounded px-4 ml-auto">SUBSCRIBE</button>
											</div>
										</div>
									</div>
									<div className="px-3 py-2">
										<div className="flex">
											
											<div className="flex flex-col font-medium">
												<a href="#" className="text-xs text-black-alt no-underline leading-tight">r/tailwind</a>
												<span className="text-xxs">1.000 subscribers</span>
											</div>
											<div className="flex ml-auto">
												<button className="bg-blue-dark text-xs text-white font-semibold rounded px-4 ml-auto">SUBSCRIBE</button>
											</div>
										</div>
									</div>
									<div className="px-3 py-2">
										<div className="flex">
											
											<div className="flex flex-col font-medium">
												<a href="#" className="text-xs text-black-alt no-underline leading-tight">r/tailwind</a>
												<span className="text-xxs">1.000 subscribers</span>
											</div>
											<div className="flex ml-auto">
												<button className="bg-blue-dark text-xs text-white font-semibold rounded px-4 ml-auto">SUBSCRIBE</button>
											</div>
										</div>
									</div>
									<div className="px-3 py-2">
										<div className="flex"> 
											
											<div className="flex flex-col font-medium"> 
												<a href="#" className="text-xs text-black-alt no-underline leading-tight">r/tailwind</a>
												<span className="text-xxs">1.000 subscribers</span>
											</div>
											<div className="flex ml-auto">
												<button className="bg-blue-dark text-xs text-white font-semibold rounded px-4 ml-auto">SUBSCRIBE</button>
											</div>
										</div>
									</div>
									<div className="px-3 py-2">
										<div className="flex">
											
											<div className="flex flex-col font-medium">
												<a href="#" className="text-xs text-black-alt no-underline leading-tight">r/tailwind</a>
												<span className="text-xxs">1.000 subscribers</span>
											</div>
											<div className="flex ml-auto">
												<button className="bg-blue-dark text-xs text-white font-semibold rounded px-4 ml-auto">SUBSCRIBE</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="rounded bg-white mb-4">
								<div className="p-3">
									<div className="flex justify-between">
										<div>
											<a href="#" className="block text-black no-underline text-xs font-medium">About</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Careers</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Press</a>
										</div>
										<div>
											<a href="#" className="block text-black no-underline text-xs font-medium">Advertise</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Blog</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Help</a>
										</div>
										<div>
											<a href="#" className="block text-black no-underline text-xs font-medium">The Reddit App</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Reddit Coins</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Reddit Premium</a>
											<a href="#" className="block text-black no-underline text-xs font-medium">Reddit Gifts</a>
										</div>
									</div>
									<div className="text-center mt-6">
										<p className="text-xs text-black leading-tight font-medium">
											<a href="#" className="text-black no-underline">Content Policy</a> | <a href="#" className="text-black no-underline">Privacy Policy</a>
										</p>
										<p className="text-xs text-black leading-tight font-medium">
											<a href="#" className="text-black no-underline">User Agreement</a> | <a href="#" className="text-black no-underline">Mod Policy</a>
										</p>
										<p className="text-xs text-black leading-tight font-medium">© 2018 Reddit, Inc. All rights reserved</p>
									</div>
								</div>
							</div>
						</div>

					</div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default club;
