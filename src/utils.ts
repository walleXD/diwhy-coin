import { createHash } from 'crypto'
import { Block } from './types'

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

export const calculateHashFromBlock = (block: Block) =>
  calculateHash(
    block.get('index'),
    block.get('prevHash'),
    block.get('timestamp'),
    block.get('data')
  )
