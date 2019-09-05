import { Map } from 'immutable'

import { genesisHash } from './env'
import { generateTimestamp, calculateHash } from './utils'
import {
  Block,
  GenesisBlock,
  RawBlock,
  RawGenesisBlock
} from './types'

export const createRawBlock = (
  blockInfo: RawBlock | RawGenesisBlock
): Block | GenesisBlock =>
  Map({
    ...blockInfo
  })

export const createBlock = (
  blockData?: string,
  prevBlock?: Block
): Block | GenesisBlock => {
  if (!blockData || !prevBlock) {
    const blockInfo = {
      index: 0,
      hash: genesisHash,
      timestamp: generateTimestamp(),
      data: 'This is the genesis'
    }

    return createRawBlock(blockInfo)
  }

  const index = prevBlock.get('index') + 1,
    timestamp = generateTimestamp(),
    data = blockData,
    prevHash = prevBlock.get('hash'),
    hash = calculateHash(index, prevHash, timestamp, data)

  return createRawBlock({
    index,
    hash,
    prevHash,
    timestamp,
    data
  })
}
