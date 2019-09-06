import { Map } from 'immutable'

import { genesisHash } from './env'
import {
  generateTimestamp,
  calculateHash,
  calculateHashFromBlock
} from './utils'
import {
  Block,
  GenesisBlock,
  RawBlock,
  RawGenesisBlock,
  BlockChain
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

export const isValidNewBlock = (
  newBlock: Block,
  prevBlock: Block
): boolean => {
  if (
    newBlock.get('index') - 1 !==
    prevBlock.get('index')
  ) {
    return false
  } else if (
    newBlock.get('prevHash') !== prevBlock.get('hash')
  )
    return false
  else if (
    calculateHashFromBlock(newBlock) !==
    newBlock.get('hash')
  )
    return false
  else return true
}

export const isValidBlockStructure = (
  block: Block
): boolean =>
  typeof block.get('index') === 'number' &&
  typeof block.get('hash') === 'string' &&
  typeof block.get('prevHash') === 'string' &&
  typeof block.get('timestamp') === 'number' &&
  typeof block.get('data') === 'string'

export const isValidGenesisBlock = (
  block: Block | GenesisBlock
): boolean => createBlock().equals(block)

export const isValidChain = (
  chain: BlockChain
): boolean => {
  if (!isValidGenesisBlock(chain.get(0) as GenesisBlock))
    return false

  // ToDo: rework w/ map & reduce op on chain
  for (let i = 1; i < chain.size; i++) {
    if (
      !isValidNewBlock(
        chain.get(1) as Block,
        chain.get(i - 1) as Block
      )
    )
      return false
  }
  return true
}
