import { NextApiRequest, NextApiResponse } from "next"

const { createClient } = require('@supabase/supabase-js')

require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { nft } = JSON.parse(req.body)

  // Insert a row
  const { data, error } = await supabase
  .from('nft')
  .insert([
      {
        token_id: nft.tokenId,
        access_control_condition: nft.accessControlCondition,
        encrypted_symmetric_key: nft.encryptedSymmetricKey
      }
  ]);

  console.log(data, error);
    
}