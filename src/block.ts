import { Map, List } from 'immutable'

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
        chain.get(i) as Block,
        chain.get(i - 1) as Block
      )
    )
      return false
  }
  return true
}

type ReturnType<T, E = Error> = [T, E | undefined] | T
export interface BlockChainManager {
  getChain: () => BlockChain
  getLatestBlock: () => Block
  addBlockToChain: (block: Block) => ReturnType<boolean>
  replaceChain: (chain: BlockChain) => ReturnType<boolean>
}

export const generateBlockChainManager = (): BlockChainManager => {
  // ToDo: Add test for BlockManager
  const genesisBlock = createBlock()

  let blockChain = List([genesisBlock])

  // getters
  const getChain = (): BlockChain => blockChain
  const getLatestBlock = (): Block =>
    blockChain.get(-1) as Block

  const addBlockToChain = (
    block: Block
  ): ReturnType<boolean> => {
    if (!isValidNewBlock(block, getLatestBlock()))
      return [false, new Error('Invalid block')]

    blockChain = blockChain.push(block)
    return [true, undefined]
  }

  const replaceChain = (
    chain: BlockChain
  ): ReturnType<boolean> => {
    if (
      isValidChain(chain) &&
      chain.size > blockChain.size
    ) {
      blockChain = chain
      // ToDo: Add broadcasting mechanism once chain is replaced
      return true
    }
    return false
  }

  return Object.freeze({
    getChain,
    getLatestBlock,
    addBlockToChain,
    replaceChain
  })
}
