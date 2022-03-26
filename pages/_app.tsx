import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { FC } from 'react'
import { Provider } from 'wagmi'

const EmptyLayout: FC = ({children}) => <>{children}</>

function MyApp({ Component, pageProps }: AppProps & {Component: {Layout: FC}}) {
  const Layout = Component.Layout ?? EmptyLayout
  return (
    <Provider autoConnect>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  )
}

export default MyApp
