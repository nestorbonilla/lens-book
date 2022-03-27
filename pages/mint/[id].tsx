import type { GetStaticPaths, GetStaticPropsContext, NextPage } from 'next'
import Image from 'next/image'
import { InferGetStaticPropsType } from 'next'
import { PaperClipIcon, PlusIcon } from '@heroicons/react/solid'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
import { Layout } from '@components/common'
import { supabase } from '../../utils/supabase'
import { useContractWrite, useContractEvent } from 'wagmi'
import LitJsSdk from 'lit-js-sdk'
import { toString } from 'uint8arrays/to-string'
import { fromString } from 'uint8arrays/from-string'
import BookABI from '../../contracts/BookABI.json'

// const Home: NextPage = ({ book }) => {
  export default function Mint({ book }: InferGetStaticPropsType<typeof getStaticProps>) {

    let smartContractAddress = '0x302B195Fe77b68652326E26E6C430338cC3bAF47'

    const [{ data, error, loading }, write] = useContractWrite(
      {
        addressOrName: smartContractAddress,
        contractInterface: BookABI,
      },
      'mint'
    )

    useContractEvent(
      {
        addressOrName: smartContractAddress,
        contractInterface: BookABI,
      },
      'MintedBookNFT',
      (event) => {
        console.log("hey: ", event)
        mintBookStep2(1)
      },
    )

    const [open, setOpen] = useState(true)
    let [encryptedUrl, setEncryptedUrl] = useState("")
    let [decryptedUrl, setDecryptedUrl] = useState("")
    let [symmetricKeyString, setSymmetricKeyString] = useState("")
    // let bookSymmetricKey = new Uint8Array()
    // let [bookSymmetricKey, setBookSymmetricKey] = useState(new Uint8Array())
    

    useEffect(() => {
        var litNodeClient = new LitJsSdk.LitNodeClient()
        litNodeClient.connect()
        window.litNodeClient = litNodeClient
        console.log('Lit ready');
    }, [])

    const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
        const reader = new FileReader;
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
    
    const mintBookStep1 = async(bookId: number) => {

      console.log('Starting to mint a new nft from book: ', bookId);

      // 1. Get authSig from the account selected in Metamask
      const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'mumbai'})

      // 2. Get IPFS URL of EPUB file
      const { data: book } = await supabase.from('book').select('*').eq('bookId', bookId).single()
      
      // 3. Get encryptedString and symetricKey from Lit by providing the ipfs hash
      const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(book.epub_ipfs)

      // 3.1 symmetricKey is an Uint8Array, so we need a string version to store it
      let symmetricKeyToString = toString(symmetricKey, 'base64')

      // 3.2 encryptedString is a Blob, so we need a string version to store it
      let base64String = await convertBlobToBase64(encryptedString)

      // 4. create metadata

      // 4.1 elaborate metadata json
      let metadata = {
        "name": book.title,
        "description": book.description,
        "image": book.cover,
        "book_url": base64String,
        "attributes": [
            {
                "trait_type": "author", 
                "value": book.author
            }
        ]
      }

      // 4.2 elaborate pinata options
      const options = {
        pinataMetadata: {
            name: "book_" + book.bookId
        }
      }

      // 4.3 get hash of metadata

      const {ipfsHash} = await fetch('/api/pinata', {
        method: 'POST',
        body: JSON.stringify({ metadata, options })
      }).then(response => response.json());

      console.log("nft metadata: ", ipfsHash)
        
      // 5. Mint NFT with the encryptedString and get tokenId
      let tokenId = await write({args: [bookId, ipfsHash]})



        


        // console.log("sk 1: ", symmetricKey)
        // const text = await new Response(encryptedString).text()
        // setBookSymmetricKey(symmetricKey);
        // bookSymmetricKey = symmetricKey;
        // console.log("sk 2: ", bookSymmetricKey);
        
        // console.log("encripted string: ", base64String)

        // const base64Response = await fetch(`${base64String}`);
        // const blob = await base64Response.blob();

        // console.log("encripted string 1: ", encryptedString);
        // console.log("encripted string 2: ", blob);

        // console.log("symmetric key: ", symmetricKey);
        
        

        setSymmetricKeyString(symmetricKeyToString)
        setEncryptedUrl(base64String)
    }

    const mintBookStep2 = async(tokenId: number) => {

      // 4. Set accessControlConditions
      const accessControlConditions = [
        {
          contractAddress: smartContractAddress,
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [
            ':userAddress',
            'latest'
          ],
          returnValueTest: {
            comparator: '>=',
            value: '10000000000000'
          }
        }
      ]

    // 5. get encryptedSymmetricKey from Lit by providing accessControlConditions, symmetricKey, authSig, and chain

      // 7. Save a record in Supabase with tokenId, accessControlConditions, and encryptedSymmetricKey.
    }
    const unlockBook = async(bookId: number) => {

      const base64 = await fetch(encryptedUrl)
      const blob = await base64.blob()

      let symetricKey = new Uint8Array()
      symetricKey = fromString(symmetricKeyString, 'base64')
      console.log("unlock symetricKey: ", symetricKey)

      const decryptedString = await LitJsSdk.decryptString(
          blob,
          symetricKey
        );
      setDecryptedUrl(decryptedString);
    }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Book Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Book details to mint.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.title}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.description}</dd>
            </div>          
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Public epub</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.epub}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">IPFS epub</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.epub_ipfs}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">IPFS encrypted</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{encryptedUrl}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">IPFS decrypted</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{decryptedUrl}</dd>
            </div>
          </dl>
        </div> 
      </div>
      <div className="max-w-7xl mx-auto flex justify-center py-5 items-center">
        <button
            onClick={() => {mintBookStep1(book.id)}}
            className="inline-flex items-center px-4 py-2 m-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lensGreen-600 hover:bg-lensGreen-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lensGreen-500"
        >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Mint Book
        </button>
        <button
            onClick={() => {unlockBook(book.id)}}
            className="inline-flex items-center px-4 py-2 m-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lensGreen-600 hover:bg-lensGreen-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lensGreen-500"
        >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Unlock Book
        </button>
      </div>
      
    </>
  )
}

Mint.Layout = Layout

export const getStaticPaths: GetStaticPaths = async () => {
    const { data: books } = await supabase.from("book").select('bookId')
    const paths = books?.map(({bookId}) => ({
        params: {
            id: bookId.toString()
        }
    }))
    return {
        paths,
        fallback: false
    }
}

export const getStaticProps = async({params}: GetStaticPropsContext<{id: string}>) => {

  const { data: book } = await supabase.from('book').select('*').eq('id', params?.id).single()
  return {
    props: {
      book,
    },
    revalidate: 4 * 6 * 60
  }
}