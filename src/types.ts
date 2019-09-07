import { Map, List } from 'immutable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImmutableMap<T> extends Map<string, any> {
  get<K extends keyof T>(name: K): T[K]
}

/** structure of a block */
export interface RawBlock {
  index: number
  hash: string
  timestamp: number
  data: string
  prevHash: string
  nonce: number
}

// immutable Map of blocks
export type Block = ImmutableMap<RawBlock>

export type BlockChain = List<Block>
