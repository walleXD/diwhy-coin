import { config } from 'dotenv'

/** init dotenv */
config()

/** hash used in genesis block */
export const genesisHash =
  process.env.GENESIS_HASH ||
  'KBNKJHKJAHSDH&*&*(SDHIUAHSDKN98yu988J(*H(U'
