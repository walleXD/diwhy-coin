import '../env'
import { Map, List } from 'immutable'

import {
  createRawBlock,
  createBlock,
  isValidNewBlock,
  isValidBlockStructure,
  isValidChain,
  generateBlockChainManager
} from '../block'
import { Block, GenesisBlock } from '../types'
import { generateTimestamp } from '../utils'

describe('block', () => {
  describe('creation', () => {
    test('raw block', () => {
      const timestamp = new Date().getTime() / 1000,
        hash = 'hhkk7tiuabnsd9yhu',
        prevHash = 'jkansd7ahsndiuansd7n',
        data = 'Hello World!',
        index = 10

      const block = createRawBlock({
        index,
        hash,
        prevHash,
        timestamp,
        data
      }) as Block

      expect(block.get('index')).toEqual(index)
      expect(block.get('hash')).toEqual(hash)
      expect(block.get('prevHash')).toEqual(prevHash)
      expect(block.get('timestamp')).toEqual(timestamp)
      expect(block.get('data')).toEqual(data)
    })

    test('genesis block', () => {
      const block = createBlock() as GenesisBlock

      /** has index 0 */
      expect(block.get('index')).toEqual(0)
    })

    test('regular block', () => {
      const data = 'A new Block'
      const genesisBlock = createBlock() as Block
      const newBlock = createBlock(
        data,
        genesisBlock
      ) as Block

      expect(newBlock.get('hash')).toBeTruthy()
      expect(newBlock.get('prevHash')).toBeTruthy()
      expect(newBlock.get('timestamp')).toBeTruthy()

      expect(newBlock.get('index')).not.toBe(0)
      expect(newBlock.get('data')).toEqual(data)
    })
  })

  describe('validation', () => {
    const blockInfo = {
      index: 0,
      hash: 'asKBHKASUHD&*HSIDUA*SD',
      prevHash: 'JHBGAS*&DHBASI&HD*^HABUID@',
      timestamp: generateTimestamp(),
      data: 'YOYOYOOOOOOO'
    }
    const genesisBlock = createBlock() as Block

    describe('new block', () => {
      test('index check', () => {
        const block = Map({
          ...blockInfo
        })

        expect(isValidNewBlock(block, genesisBlock)).toBe(
          false
        )
      })

      test('prev hash check', () => {
        const block = Map({
          ...blockInfo,
          index: 1
        })

        expect(isValidNewBlock(block, genesisBlock)).toBe(
          false
        )
      })

      test('hash check', () => {
        const block = Map({
          ...blockInfo,
          index: 1,
          prevHash: genesisBlock.get('hash')
        })

        expect(isValidNewBlock(block, genesisBlock)).toBe(
          false
        )
      })
    })

    describe('block structure', () => {
      test('index type', () => {
        const block = Map({
          ...blockInfo,
          index: '1'
        })

        expect(isValidBlockStructure(block)).toBe(false)
      })

      test('hash type', () => {
        const block = Map({
          ...blockInfo,
          hash: 12837291837182973
        })

        expect(isValidBlockStructure(block)).toBe(false)
      })

      test('prevHash type', () => {
        const block = Map({
          ...blockInfo,
          prevHash: 12837291837182973
        })

        expect(isValidBlockStructure(block)).toBe(false)
      })

      test('timestamp type', () => {
        const block = Map({
          ...blockInfo,
          timestamp: 'Hello'
        })

        expect(isValidBlockStructure(block)).toBe(false)
      })

      test('data type', () => {
        const block = Map({
          ...blockInfo,
          data: 12837291837182973
        })

        expect(isValidBlockStructure(block)).toBe(false)
      })
    })

    describe('chain', () => {
      test('genesis block', () => {
        const chain = List([Map(blockInfo)])

        expect(isValidChain(chain)).toBe(false)
      })

      test('all non-genesis blocks', () => {
        const block1 = createBlock(
          'block 1',
          genesisBlock
        ) as Block
        const block2 = createBlock('block 2', block1)
        const block3 = Map(blockInfo)

        const chain = List([
          createBlock(),
          block1,
          block2,
          block3
        ])

        expect(isValidChain(chain)).toBe(false)
      })
    })
  })

  describe('manager', () => {
    const genesisBlock = createBlock() as Block
    const block1 = createBlock(
      'block 1',
      genesisBlock
    ) as Block
    const blockChain = List([genesisBlock, block1])
    const chainManager = generateBlockChainManager(
      blockChain
    )

    test('init with existing chain', () => {
      expect(chainManager.getChain()).toEqual(blockChain)
    })

    test('get latest block', () => {
      expect(chainManager.getLatestBlock()).toEqual(block1)
    })

    test('adding new block to chain', () => {
      const block2 = createBlock('block2', block1) as Block

      chainManager.addBlockToChain(block2)

      expect(chainManager.getLatestBlock()).toEqual(block2)
    })

    test('replace chain', () => {
      const newChainManager = generateBlockChainManager()

      for (let i = 0; i < 10; i++) {
        const block = createBlock(
          `block ${i}`,
          newChainManager.getLatestBlock()
        ) as Block
        newChainManager.addBlockToChain(block)
      }

      const success = chainManager.replaceChain(
        newChainManager.getChain()
      )

      expect(success).toEqual(true)
      expect(chainManager.getChain()).toEqual(
        newChainManager.getChain()
      )
    })

    test('replace fails w/ shorter chain', () => {
      const newChainManager = generateBlockChainManager(),
        newChain = newChainManager.getChain(),
        success = chainManager.replaceChain(newChain)

      expect(success).toEqual(false)
      expect(newChain).not.toEqual(chainManager.getChain())
    })
  })
})
