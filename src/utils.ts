import { createHash } from 'crypto'
import { Block } from './types'

/**
 * time in seconds
 * @returns time is seconds
 */
export const generateTimestamp = (): number =>
  new Date().getTime() / 1000

/**
 * calculates hash from info from a block
 * @param index
 * @param prevHash
 * @param timestamp
 * @param data
 * @returns hash calculated from provided info
 */
export const calculateHash = (
  index: number,
  prevHash: string,
  timestamp: number,
  data: string,
  nonce: number
): string =>
  createHash('sha512')
    .update(
      `${index}${prevHash}${timestamp}${data}${nonce}`
    )
    .digest('base64')

/**
 * calculate hash from a given block
 * @param block block used for hash calculation
 * @returns hash calculated from provided block
 */
export const calculateHashFromBlock = (
  block: Block
): string =>
  calculateHash(
    block.get('index'),
    block.get('prevHash'),
    block.get('timestamp'),
    block.get('data'),
    block.get('nonce')
  )
