import type { GetStaticPaths, GetStaticPropsContext, NextPage } from 'next'
import Image from 'next/image'
import { InferGetStaticPropsType } from 'next'
import { PaperClipIcon, PlusIcon } from '@heroicons/react/solid'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
import { Layout } from '@components/common'
import { supabase } from '../../utils/supabase'
import { useContractWrite, useContractEvent, useContract, useSigner, useProvider } from 'wagmi'
import LitJsSdk from 'lit-js-sdk'
import { toString } from 'uint8arrays/to-string'
import { fromString } from 'uint8arrays/from-string'
import BookABI from '../../contracts/BookABI.json'
import { createAlchemyWeb3 } from '@alch/alchemy-web3'

export default function Mint({ book }: InferGetStaticPropsType<typeof getStaticProps>) {

  let chain = 'mumbai'
  let smartContractAddress = process.env.NEXT_PUBLIC_BOOK_SMART_CONTRACT
  const [{data: signerData}] = useSigner()

  const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_WS)

  const bookContract = new web3.eth.Contract(
    BookABI,
    smartContractAddress
  );

  function addSmartContractListener() {
    bookContract.events.MintedBookNFT({}, (error, data) => {
      if (error) {
        console.log("😥 " + error.message);
      } else {
        // console.log("hey there", data.returnValues[1])
        let myNewTokenId = Number(data.returnValues[1])
        setNewTokenId(myNewTokenId)
      }
    });
  }
  
  const [newTokenId, setNewTokenId] = useState<any>(0)

  const [{ data: dataWrite, error: errorWrite, loading: loadingWrite }, write] = useContractWrite(
    {
      addressOrName: smartContractAddress,
      contractInterface: BookABI,
      signerOrProvider: signerData
    },
    'mint'
  )

  let [encryptedUrl, setEncryptedUrl] = useState("")
  let [decryptedUrl, setDecryptedUrl] = useState("")
  let [symmetricKeyString, setSymmetricKeyString] = useState("")
  
  useEffect(() => {
      var litNodeClient = new LitJsSdk.LitNodeClient()
      litNodeClient.connect()
      window.litNodeClient = litNodeClient
      addSmartContractListener()
  }, [])

  useEffect(() => {
    console.log('newTokenId has been updated')
    console.log('newTokenId: ', newTokenId)
    mintBookStep2(newTokenId)
  }, [newTokenId])

  const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
      const reader = new FileReader
      reader.onerror = reject
      reader.onload = () => {
          resolve(reader.result)
      };
      reader.readAsDataURL(blob)
  });
  
  const mintBookStep1 = async(bookId: number) => {

    console.log('Mint Book step 1 for book: ', bookId)

    // 1. Get authSig from the account selected in Metamask
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})

    // 2. Get IPFS URL of EPUB file
    const { data: book } = await supabase.from('book').select('*').eq('bookId', bookId).single()
    
    // 3. Get encryptedString and symetricKey from Lit by providing the ipfs hash
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(book.epub_ipfs)

    // 3.1 encryptedString is a Blob, so we need a string version to store it
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
    const {ipfsHash} = await fetch('/api/ipfs', {
      method: 'POST',
      body: JSON.stringify({ metadata, options })
    }).then(response => response.json());

    // console.log("nft metadata: ", ipfsHash)
      
    // 5. Mint NFT with the encryptedString and get tokenId
    await write({args: [bookId, ipfsHash]})

    // 5.1 symmetricKey is an Uint8Array, so we need a string version to store it
    let symmetricKeyToString = toString(symmetricKey, 'base64')

    setSymmetricKeyString(symmetricKeyToString)
    setEncryptedUrl(base64String)
  }

  const mintBookStep2 = async(tokenId: number) => {

    console.log('Mint Book step 2 for tokenId: ', tokenId)

    // 6. Set accessControlConditions
    const accessControlConditions = [
      {
        contractAddress: smartContractAddress,
        standardContractType: 'ERC721',
        chain,
        method: 'ownerOf',
        parameters: [
          tokenId.toString()
        ],
        returnValueTest: {
          comparator: '=',
          value: ':userAddress'
        }
      }
    ]

    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})
    let symmetricKey = new Uint8Array()
    symmetricKey = fromString(symmetricKeyString, 'base64')

    // 7. get encryptedSymmetricKey from Lit by providing accessControlConditions, symmetricKey, authSig, and chain
    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    })

    let encryptedSymmetricKeyToString = toString(encryptedSymmetricKey, 'base64')

    // 8. Save a record in Supabase with tokenId, accessControlConditions, and encryptedSymmetricKey
    let nft = {
      tokenId,
      accessControlConditions,
      encryptedSymmetricKey: encryptedSymmetricKeyToString
    }
    await fetch('/api/setNFT', {
      method: 'POST',
      body: JSON.stringify({ nft })
    }).then(response => response.json())

  }

  const unlockBook = async() => {

    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})

    console.log("unlock => tokenId: ", newTokenId)
    // get accessControlCondition and encryptedSymmetricKey from nft table stored in Supabase
    const getNFTUrl = `/api/getNFT?tokenId=${newTokenId}`
    console.log("unlock => NFTUrl: ", getNFTUrl)
    const { book: dbBook } = await fetch(getNFTUrl).then(response => response.json())
    console.log("unlock => book: ", dbBook)
    
    let accessControlConditions = JSON.parse(dbBook.access_control_condition)

    let unlockEncryptedSymmetricKey = fromString(dbBook.encrypted_symmetric_key, 'base64')

    let symmetricKey = await window.litNodeClient.getEncryptionKey({
      accessControlConditions,
      // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
      toDecrypt: LitJsSdk.uint8arrayToString(unlockEncryptedSymmetricKey, "base16"),
      chain,
      authSig
    })

    console.log("unlock => before tokenURI.")

    // get the book_url from the nft stored in the smart contract
    let tokenURI = ''
    try {
      tokenURI = await bookContract.methods.tokenURI(newTokenId).call();
      console.log('tokenURI: ', tokenURI)
    } catch (error) {
      console.log(error)
    }

    // get the metadata json from tokenURI
    const metadataJson = await fetch(tokenURI).then((response) => response.json())
    console.log('metadata: ', metadataJson)

    // convert string version to blob
    const base64Response = await fetch(metadataJson.book_url)
    const blob = await base64Response.blob()

    const decryptedString = await LitJsSdk.decryptString(
        blob,
        symmetricKey
      );
    setDecryptedUrl(decryptedString)
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
              <dt className="text-sm font-medium text-gray-500">Token Id</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{newTokenId}</dd>
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
            onClick={() => {unlockBook(newTokenId)}}
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