import LENS_HUB_ABI from './lenshubabi.json';
import { ethers } from 'ethers';

let LENS_HUB_CONTRACT_ADDRESS = '0x7c86e2a63941442462cce73EcA9F07F4Ad023261';

// lens contract info can all be found on the deployed
// contract address on polygon.
// not defining here as it will bloat the code example
// export const lensHub = new ethers.Contract(
//   LENS_HUB_CONTRACT_ADDRESS,
//   LENS_HUB_ABI,
//   getSigner()
// )