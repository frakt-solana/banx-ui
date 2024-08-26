import { BN, web3 } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { DBOffer } from './types'

export const convertBondOfferV3ToDBOffer = (offer: BondOfferV3): DBOffer => {
  return {
    publicKey: offer.publicKey.toBase58(),
    assetReceiver: offer.assetReceiver.toBase58(),
    baseSpotPrice: offer.baseSpotPrice.toString(),
    bidCap: offer.bidCap.toString(),
    bidSettlement: offer.bidSettlement.toString(),
    bondingCurve: {
      delta: offer.bondingCurve.delta.toString(),
      bondingType: offer.bondingCurve.bondingType,
    },
    buyOrdersQuantity: offer.buyOrdersQuantity.toString(),
    concentrationIndex: offer.concentrationIndex.toString(),
    currentSpotPrice: offer.currentSpotPrice.toString(),
    edgeSettlement: offer.edgeSettlement.toString(),
    fundsSolOrTokenBalance: offer.fundsSolOrTokenBalance.toString(),
    lastTransactedAt: offer.lastTransactedAt.toString(),
    mathCounter: offer.mathCounter.toString(),
    pairState: offer.pairState,
    hadoMarket: offer.hadoMarket?.toBase58(),

    validation: {
      loanToValueFilter: offer.validation.loanToValueFilter.toString(),
      collateralsPerToken: offer.validation.collateralsPerToken.toString(),
      maxReturnAmountFilter: offer.validation.maxReturnAmountFilter.toString(),
      bondFeatures: offer.validation.bondFeatures,
    },

    fundsInCurrentEpoch: offer.fundsInCurrentEpoch.toString(),
    fundsInNextEpoch: offer.fundsInNextEpoch.toString(),
    lastCalculatedSlot: offer.lastCalculatedSlot.toString(),
    lastCalculatedTimestamp: offer.lastCalculatedTimestamp.toString(),
    rewardsToHarvest: offer.rewardsToHarvest.toString(),
    rewardsToHarvested: offer.rewardsToHarvested.toString(),
    loanApr: offer.loanApr.toString(),
  }
}

export const convertDBOfferToBondOfferV3 = (offer: DBOffer): BondOfferV3 => {
  return {
    publicKey: new web3.PublicKey(offer.publicKey),
    assetReceiver: new web3.PublicKey(offer.assetReceiver),
    baseSpotPrice: new BN(offer.baseSpotPrice),
    bidCap: new BN(offer.bidCap),
    bidSettlement: new BN(offer.bidSettlement),
    bondingCurve: {
      delta: new BN(offer.bondingCurve.delta),
      bondingType: offer.bondingCurve.bondingType,
    },
    buyOrdersQuantity: new BN(offer.buyOrdersQuantity),
    concentrationIndex: new BN(offer.concentrationIndex),
    currentSpotPrice: new BN(offer.currentSpotPrice),
    edgeSettlement: new BN(offer.edgeSettlement),
    fundsSolOrTokenBalance: new BN(offer.fundsSolOrTokenBalance),
    lastTransactedAt: new BN(offer.lastTransactedAt),
    mathCounter: new BN(offer.mathCounter),
    pairState: offer.pairState,
    hadoMarket: new web3.PublicKey(offer.hadoMarket),

    validation: {
      loanToValueFilter: new BN(offer.validation.loanToValueFilter),
      collateralsPerToken: new BN(offer.validation.collateralsPerToken),
      maxReturnAmountFilter: new BN(offer.validation.maxReturnAmountFilter),
      bondFeatures: offer.validation.bondFeatures,
    },

    fundsInCurrentEpoch: new BN(offer.fundsInCurrentEpoch),
    fundsInNextEpoch: new BN(offer.fundsInNextEpoch),
    lastCalculatedSlot: new BN(offer.lastCalculatedSlot),
    lastCalculatedTimestamp: new BN(offer.lastCalculatedTimestamp),
    rewardsToHarvest: new BN(offer.rewardsToHarvest),
    rewardsToHarvested: new BN(offer.rewardsToHarvested),
    loanApr: new BN(offer.loanApr),
  }
}
