import { Map, List } from 'immutable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImmutableMap<T> extends Map<string, any> {
  get<K extends keyof T>(name: K): T[K]
}

export interface RawGenesisBlock {
  index: number
  hash: string
  timestamp: number
  data: string
}

export interface RawBlock extends RawGenesisBlock {
  prevHash: string
}

export type GenesisBlock = ImmutableMap<RawGenesisBlock>
export type Block = ImmutableMap<RawBlock>

export type BlockChain = List<GenesisBlock | Block>
