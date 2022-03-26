import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { InferGetStaticPropsType } from 'next'
import { supabase } from '../utils/supabase'
import { Layout } from '@components/common'

// const Home: NextPage = ({ books }) => {
  export default function Home({ books }: InferGetStaticPropsType<typeof getStaticProps>) {
  console.log({books})
  return (
    <div>
      <h1>Hello</h1>
    </div>
  )
}

Home.Layout = Layout

export async function getStaticProps() {
  const { data: books } = await supabase.from('book').select('*')
  return {
    props: {
      books,
    },
    revalidate: 4 * 6 * 60
  }
}