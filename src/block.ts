import { Map, List } from 'immutable'

import { genesisHash } from './env'
import {
  generateTimestamp,
  calculateHash,
  calculateHashFromBlock
} from './utils'
import { Block, RawBlock, BlockChain } from './types'

/**
 * creates a block from provided info
 * @param blockInfo info used to generate a block
 * @returns `Block`
 */
export const createRawBlock = (
  blockInfo: RawBlock
): Block =>
  Map({
    ...blockInfo
  })

/**
 * create a block from data & the last block in chain
 * @param blockData data to be stored in block
 * @param prevBlock last block in the chain
 * @returns `Block`
 */
export const createBlock = (
  blockData?: string,
  prevBlock?: Block,
  nonce?: number
): Block => {
  if (!blockData || !prevBlock || nonce === undefined) {
    const blockInfo = {
      index: 0,
      hash: genesisHash,
      timestamp: generateTimestamp(),
      data: 'This is the genesis',
      prevHash: '',
      nonce: 0
    }

    return createRawBlock(blockInfo)
  }

  const index = prevBlock.get('index') + 1,
    timestamp = generateTimestamp(),
    data = blockData,
    prevHash = prevBlock.get('hash'),
    hash = calculateHash(
      index,
      prevHash,
      timestamp,
      data,
      nonce
    )

  return createRawBlock({
    index,
    hash,
    prevHash,
    timestamp,
    data,
    nonce
  })
}

export const mineBlock = (
  blockData: string,
  prevBlock: Block,
  difficulty: number,
  nonce = 0
): Block => {
  let newBlock: Block
  let _nonce = nonce || 0

  do {
    newBlock = createBlock(blockData, prevBlock, _nonce++)
  } while (
    newBlock.get('hash').substring(0, difficulty) !==
    Array(difficulty + 1).join('0')
  )

  return newBlock
}

export const mineBlockRec = (
  blockData: string,
  prevBlock: Block,
  difficulty: number,
  nonce = 0
): Block => {
  const newBlock = createBlock(blockData, prevBlock, nonce)

  if (
    newBlock.get('hash').substring(0, difficulty) !==
    Array(difficulty + 1).join('0')
  )
    return mineBlockRec(
      blockData,
      prevBlock,
      difficulty,
      nonce + 1
    )
  else return newBlock
}

/**
 * check whether the newly generated block is valid
 * @param newBlock block to check
 * @param prevBlock block to check w/
 * @returns `boolean`
 */
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

/**
 * check whether the block contains all necessary info
 * @param block to check
 * @returns `boolean`
 */
export const isValidBlockStructure = (
  block: Block
): boolean =>
  typeof block.get('index') === 'number' &&
  typeof block.get('hash') === 'string' &&
  typeof block.get('prevHash') === 'string' &&
  typeof block.get('timestamp') === 'number' &&
  typeof block.get('data') === 'string'

/**
 * check whether given block is a valid genesis block
 * @param block to check
 * @returns `boolean`
 */
export const isValidGenesisBlock = (
  block: Block
): boolean => {
  const activeBlock = block
  const genesis = createBlock()
  return (
    activeBlock.get('index') === 0 &&
    activeBlock.get('hash') === genesis.get('hash') &&
    activeBlock.get('data') === genesis.get('data')
  )
}

/**
 * check whether the blockchain is valid
 * @param chain to check
 * @return `boolean`
 */
export const isValidChain = (
  chain: BlockChain
): boolean => {
  if (!isValidGenesisBlock(chain.get(0) as Block))
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

/**
 * generates a manager object to store and manage a blockchain
 * @param chain to build the manager with, if provided
 * @returns `BlockChainManager`
 */
export const generateBlockChainManager = (
  chain?: BlockChain
): BlockChainManager => {
  // store
  let blockChain: BlockChain =
    chain || List([createBlock()])

  // getters
  const getChain = (): BlockChain => blockChain
  const getLatestBlock = (): Block =>
    blockChain.get(-1) as Block

  // actions
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
