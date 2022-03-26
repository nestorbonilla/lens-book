import { FC } from "react";
import Image from "next/image";

const Layout: FC = ({children}) => {
    return (
        <div className="layout">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
                    <div className="flex justify-start lg:w-0 lg:flex-1">
                        <a href="#">
                            <span className="sr-only">Workflow</span>
                            <Image src="/logo.svg" height={120} width={120} className="h-8 w-auto sm:h-10" alt="lens-book"/>
                            {/* <img
                                className="h-8 w-auto sm:h-10"
                                src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                                alt=""
                            /> */}
                        </a>
                    </div>
        
                    <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                        Author
                    </a>
                    <a href="/mint/1" className="text-base font-medium text-gray-500 hover:text-gray-900">
                        Minter
                    </a>
                    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">                       
                        <a
                            href="#"
                            className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-lensGreen-500 hover:bg-lensGreen-700"
                        >
                            Connect Wallet
                        </a>
                    </div>
                </div>
                <div>
                    { children }
                </div>
            </div>
        </div>
      
    )
}

export default Layout