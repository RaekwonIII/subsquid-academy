import type {Result} from './support'

export interface AssetDetails {
  owner: Uint8Array
  issuer: Uint8Array
  admin: Uint8Array
  freezer: Uint8Array
  supply: bigint
  deposit: bigint
  minBalance: bigint
  isSufficient: boolean
  accounts: number
  sufficients: number
  approvals: number
  isFrozen: boolean
}
