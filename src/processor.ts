import {lookupArchive} from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import {BatchContext, BatchProcessorItem, SubstrateBatchProcessor, toHex} from "@subsquid/substrate-processor"
import {Store, TypeormDatabase} from "@subsquid/typeorm-store"
import {In} from "typeorm"
import { Asset, AssetOperation, AssetStatus} from "./model"
import {AssetsBurnedEvent, AssetsIssuedEvent, AssetsTransferredEvent} from "./types/events"


const processor = new SubstrateBatchProcessor()
    .setBatchSize(500)
    .setDataSource({
        // Lookup archive by the network name in the Subsquid registry
        archive: lookupArchive("moonbeam", {release: "FireSquid"})

        // Use archive created by archive/docker-compose.yml
        // archive: 'http://localhost:8888/graphql'
    })
    .addEvent('Assets.Issued', {
        data: {
            event: {
                args: true,
                extrinsic: {
                    hash: true,
                    fee: true
                }
            }
        }
    } as const)
    .addEvent('Assets.Transferred', {
        data: {
            event: {
                args: true,
                extrinsic: {
                    hash: true,
                    fee: true
                }
            }
        }
    } as const)
    .addEvent('Assets.Burned', {
        data: {
            event: {
                args: true,
                extrinsic: {
                    hash: true,
                    fee: true
                }
            }
        }
    } as const)


type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchContext<Store, Item>


processor.run(new TypeormDatabase(), async ctx => {
    const assetOperations = getOperationsData(ctx);

    const assetIds = new Set(assetOperations.map(op => op.assetId));

    const assets = await ctx.store.findBy(Asset, { id: In([...assetIds])})
    .then((assetsFound) => {
        return new Map(assetsFound.map((a) => [a.id, a]));
    });

    const assetOps: AssetOperation[] = [];
    for (const operation of assetOperations) {
        const {id, amount, assetId, status, from, to} = operation;

        const asset = getAsset(assets, assetId);
        asset.status = status;
        
        assetOps.push(
            new AssetOperation({
                id,
                asset,
                to,
                from,
                amount,
            })
        )
    }

    await ctx.store.save(Array.from(assets.values()));
})

function getAsset(assetMap: Map<string, Asset>, id: string): Asset {
    let asset = assetMap.get(id);

    if (asset == null) {
        asset = new Asset();
        asset.id = id;
        asset.status = AssetStatus.ISSUED;
        assetMap.set(id, asset);
    }

    return asset;
}

interface AssetOperationInterface {
    id: string;
    assetId: string;
    amount: bigint;
    to?: string;
    from?: string;
    status: AssetStatus;
}

function getOperationsData(ctx: Ctx): AssetOperationInterface[] {
    const assetOperations: AssetOperationInterface[] = [];

    for (const block of ctx.blocks) {
        for (const item of block.items) {
            if (item.name === "Assets.Issued") {
                const event = new AssetsIssuedEvent(ctx, item.event).asV1201;

                assetOperations.push({
                    id: item.event.id,
                    assetId: event.assetId.toString(),
                    amount: event.totalSupply,
                    to: toHex(event.owner),
                    status: AssetStatus.ISSUED
                });
            }
            if (item.name === "Assets.Transferred") {
                const event = new AssetsTransferredEvent(ctx, item.event).asV1201;

                assetOperations.push({
                    id: item.event.id,
                    assetId: event.assetId.toString(),
                    amount: event.amount,
                    from: toHex(event.from),
                    to: toHex(event.to),
                    status: AssetStatus.TRANSFERRED
                });
            }
            if (item.name === "Assets.Burned") {
                const event = new AssetsBurnedEvent(ctx, item.event).asV1201;

                assetOperations.push({
                    id: item.event.id,
                    assetId: event.assetId.toString(),
                    amount: event.balance,
                    from: toHex(event.owner),
                    status: AssetStatus.ISSUED
                });
            }
        }
    }

    return assetOperations;
}
