import type { AppProps } from 'next/app'
import { FC } from 'react'
import { Provider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'
import '../styles/globals.css'

const EmptyLayout: FC = ({children}) => <>{children}</>

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
// const alchemyId = process.env.ALCHEMY_KEY

// Chains for connectors to support
const chains = defaultChains

// // Set up connectors
const connectors = ({ chainId }: any) => {
  // const rpcUrl =
  //   chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
  //   chain.mainnet.rpcUrls[0]
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
    // new WalletConnectConnector({
    //   options: {
    //     rpc: {
    //       1: process.env.ALCHEMY_RPC_URL ?  process.env.ALCHEMY_RPC_URL : '', 
    //     },
    //     qrcode: true,
    //   },
    // }),
    // new WalletLinkConnector({
    //   options: {
    //     appName: 'LensBook',
    //     jsonRpcUrl: `${rpcUrl}/${alchemyId}`,
    //   },
    // }),
  ]
}


function MyApp({ Component, pageProps }: AppProps & {Component: {Layout: FC}}) {
  const Layout = Component.Layout ?? EmptyLayout

  return (
    <Provider autoConnect connectors={connectors}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  )
}

export default MyApp
