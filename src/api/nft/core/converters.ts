import { BN } from 'fbonds-core'
import {
  BondFeatures,
  BondOfferV3,
  BondingCurveType,
  PairState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { convertValuesInAccount } from 'solana-transactions-parser'
import { z } from 'zod'

import { SerializedPublicKeySchema } from '@banx/api/shared'

import { Offer } from './types'

export const convertBondOfferV3ToCore = (bondOffer: BondOfferV3): Offer => {
  return convertValuesInAccount<Offer>(bondOffer, {
    bnParser: (v) => {
      return v.toNumber()
    },
    pubkeyParser: (v) => v.toBase58(),
  })
}

export const convertCoreOfferToBondOfferV3 = (offer: Offer): BondOfferV3 => {
  return BondOfferV3Schema.parse(offer)
}

const SerializedToNumberBNSchema = z.number().transform((value) => {
  return new BN(value)
})

const BondOfferV3Schema = z.object({
  publicKey: SerializedPublicKeySchema,
  assetReceiver: SerializedPublicKeySchema,
  baseSpotPrice: SerializedToNumberBNSchema,
  bidCap: SerializedToNumberBNSchema,
  bidSettlement: SerializedToNumberBNSchema,
  bondingCurve: z.object({
    delta: SerializedToNumberBNSchema,
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: SerializedToNumberBNSchema,
  concentrationIndex: SerializedToNumberBNSchema,
  currentSpotPrice: SerializedToNumberBNSchema,
  edgeSettlement: SerializedToNumberBNSchema,
  fundsSolOrTokenBalance: SerializedToNumberBNSchema,
  hadoMarket: SerializedPublicKeySchema,
  lastTransactedAt: SerializedToNumberBNSchema,
  mathCounter: SerializedToNumberBNSchema,
  pairState: z.nativeEnum(PairState),
  validation: z.object({
    loanToValueFilter: SerializedToNumberBNSchema,
    collateralsPerToken: SerializedToNumberBNSchema,
    maxReturnAmountFilter: SerializedToNumberBNSchema,
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  fundsInCurrentEpoch: SerializedToNumberBNSchema,
  fundsInNextEpoch: SerializedToNumberBNSchema,
  lastCalculatedSlot: SerializedToNumberBNSchema,
  lastCalculatedTimestamp: SerializedToNumberBNSchema,
  rewardsToHarvest: SerializedToNumberBNSchema,
  rewardsToHarvested: SerializedToNumberBNSchema,
  loanApr: SerializedToNumberBNSchema,
})
