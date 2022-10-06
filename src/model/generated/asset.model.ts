import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {AssetStatus} from "./_assetStatus"

@Entity_()
export class Asset {
  constructor(props?: Partial<Asset>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  supply!: bigint | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  minBalance!: bigint | undefined | null

  @Column_("bool", {nullable: true})
  isSufficient!: boolean | undefined | null

  @Column_("varchar", {length: 11, nullable: false})
  status!: AssetStatus
}
