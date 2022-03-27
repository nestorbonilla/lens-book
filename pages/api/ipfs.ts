import { NextApiRequest, NextApiResponse } from "next"

const pinataSDK = require('@pinata/sdk')

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { metadata, options } = JSON.parse(req.body)

  pinata.pinJSONToIPFS(metadata, options).then((result: any) => {
    res.status(200).json({ ipfsHash: result.IpfsHash })
  }).catch((err: any) => {
    console.log(err)
  })
    
}