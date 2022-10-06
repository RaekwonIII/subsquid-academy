import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result} from './support'
import * as v1201 from './v1201'

export class AssetsAssetStorage {
  private readonly _chain: Chain
  private readonly blockHash: string

  constructor(ctx: BlockContext)
  constructor(ctx: ChainContext, block: Block)
  constructor(ctx: BlockContext, block?: Block) {
    block = block || ctx.block
    this.blockHash = block.hash
    this._chain = ctx._chain
  }

  /**
   *  Details of an asset.
   */
  get isV1201() {
    return this._chain.getStorageItemTypeHash('Assets', 'Asset') === 'a773fde1dd7a052d5bc865fdd7ffba9fed0a1840f51dee25c7a6416d0e751e2e'
  }

  /**
   *  Details of an asset.
   */
  async getAsV1201(key: bigint): Promise<v1201.AssetDetails | undefined> {
    assert(this.isV1201)
    return this._chain.getStorage(this.blockHash, 'Assets', 'Asset', key)
  }

  async getManyAsV1201(keys: bigint[]): Promise<(v1201.AssetDetails | undefined)[]> {
    assert(this.isV1201)
    return this._chain.queryStorage(this.blockHash, 'Assets', 'Asset', keys.map(k => [k]))
  }

  async getAllAsV1201(): Promise<(v1201.AssetDetails)[]> {
    assert(this.isV1201)
    return this._chain.queryStorage(this.blockHash, 'Assets', 'Asset')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this._chain.getStorageItemTypeHash('Assets', 'Asset') != null
  }
}
