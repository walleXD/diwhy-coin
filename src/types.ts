import { Map, List } from 'immutable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImmutableMap<T> extends Map<string, any> {
  get<K extends keyof T>(name: K): T[K]
}

/** structure of a genesis block */
export interface RawGenesisBlock {
  index: number
  hash: string
  timestamp: number
  data: string
}

/** structure of a block */
export interface RawBlock extends RawGenesisBlock {
  prevHash: string
}

// immutable Map of blocks
export type GenesisBlock = ImmutableMap<RawGenesisBlock>
export type Block = ImmutableMap<RawBlock>

export type BlockChain = List<GenesisBlock | Block>
