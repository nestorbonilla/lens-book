import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Layout } from '@components/common'
import { FC } from 'react'

const EmptyLayout: FC = ({children}) => <>{children}</>

function MyApp({ Component, pageProps }: AppProps & {Component: {Layout: FC}}) {
  const Layout = Component.Layout ?? EmptyLayout
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
