import { createHash } from 'crypto'

export const generateTimestamp = () =>
  new Date().getTime() / 1000

export const calculateHash = (
  index: number,
  prevHash: string,
  timestamp: number,
  data: string
) =>
  createHash('sha512')
    .update(`${index}${prevHash}${timestamp}${data}`)
    .digest('hex')
