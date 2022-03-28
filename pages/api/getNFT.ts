import { NextApiRequest, NextApiResponse } from "next"

const { createClient } = require('@supabase/supabase-js')

require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { tokenId } = req.query
  const { data } = await supabase.from('nft').select('*').eq('token_id', parseInt(tokenId.toString()) ).single()

  res.status(200).json({ data })
}