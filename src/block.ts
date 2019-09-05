import { genesisHash } from './env'
import { generateTimestamp, calculateHash } from './utils'

export interface Block {
  index: number
  hash: string
  prevHash?: string
  timestamp: number
  data: string
}

export type BlockChain = Block[]

export const createRawBlock = (blockInfo: Block) =>
  Object.freeze({
    ...blockInfo
  })

export const createBlock = (
  blockData?: string,
  prevBlock?: Block
): Block => {
  if (!blockData || !prevBlock) {
    const blockInfo = {
      index: 0,
      hash: genesisHash,
      timestamp: generateTimestamp(),
      data: 'This is the genesis'
    }

    return createRawBlock(blockInfo)
  }

  const index = prevBlock.index + 1,
    timestamp = generateTimestamp(),
    data = blockData,
    prevHash = prevBlock.hash,
    hash = calculateHash(index, prevHash, timestamp, data)

  return createRawBlock({
    index,
    hash,
    prevHash,
    timestamp,
    data
  })
}
