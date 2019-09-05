import '../env'
import { createRawBlock, createBlock } from '../block'

describe('block creation', () => {
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
    })

    expect(block.index).toEqual(index)
    expect(block.hash).toEqual(hash)
    expect(block.prevHash).toEqual(prevHash)
    expect(block.timestamp).toEqual(timestamp)
    expect(block.data).toEqual(data)
  })

  test('genesis block', () => {
    const block = createBlock()

    /** has index 0 */
    expect(block.index).toEqual(0)

    /** has no previous hash */
    expect(block.prevHash).toBeFalsy()
  })

  test('regular block', () => {
    const data = 'A new Block'
    const genesisBlock = createBlock()
    const newBlock = createBlock(data, genesisBlock)

    expect(newBlock.hash).toBeTruthy()
    expect(newBlock.prevHash).toBeTruthy()
    expect(newBlock.timestamp).toBeTruthy()

    expect(newBlock.index).not.toBe(0)
    expect(newBlock.data).toEqual(data)
  })
})
