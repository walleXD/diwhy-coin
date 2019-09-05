import '../env'
import { createRawBlock, createBlock } from '../block'
import { Block, GenesisBlock } from '../types'

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

  describe('validity', () => {})
})
