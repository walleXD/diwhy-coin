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
): boolean => {
  const activeBlock = block as GenesisBlock
  const genesis = createBlock() as GenesisBlock
  return (
    activeBlock.get('index') === 0 &&
    activeBlock.get('hash') === genesis.get('hash') &&
    activeBlock.get('data') === genesis.get('data')
  )
}

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

type ReturnType<T, E = Error> =
  | [undefined, E]
  | [T, undefined]

export interface BlockChainManager {
  /**
   * @returns the blockchain in the manager
   */
  getChain: () => BlockChain
  /**
   * @returns the last block on the chain
   */
  getLatestBlock: () => Block
  /**
   * Add provided block to blockchain
   * @param block block which will be added to the chain
   * @returns `[blockchain, err]` if successful, the blockchain with the new block or an error object
   */
  addBlockToChain: (block: Block) => ReturnType<BlockChain>
  /**
   * replaces chain with one from peer if conditions are met
   * @param chain blockchain from peer
   * @returns true or false as to whether the replacement was successful
   */
  replaceChain: (chain: BlockChain) => boolean
}

export const generateBlockChainManager = (
  chain?: BlockChain
): BlockChainManager => {
  let blockChain: BlockChain =
    chain || List([createBlock()])

  // getters
  const getChain = (): BlockChain => blockChain
  const getLatestBlock = (): Block =>
    blockChain.get(-1) as Block

  const addBlockToChain = (
    block: Block
  ): ReturnType<BlockChain> => {
    if (!isValidNewBlock(block, getLatestBlock()))
      return [undefined, new Error('Invalid block')]

    blockChain = blockChain.push(block)
    return [blockChain, undefined]
  }

  const replaceChain = (chain: BlockChain): boolean => {
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
