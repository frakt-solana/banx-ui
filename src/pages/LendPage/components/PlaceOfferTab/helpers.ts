import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  optimisticInitializeBondOfferBonding,
  optimisticUpdateBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'
import { SyntheticOffer } from '@banx/store'

type CalculateOfferSize = (props: {
  loanValue: number //? normal number
  deltaValue: number //? normal number
  loansQuantity: number //? integer number
  syntheticOffer: SyntheticOffer
}) => BondOfferV2

export const getUpdatedBondOffer: CalculateOfferSize = ({
  loanValue,
  deltaValue,
  loansQuantity,
  syntheticOffer,
}) => {
  const deltaValueInLamports = deltaValue * 1e9
  const loanValueInLamports = loanValue * 1e9

  const initializedOffer = optimisticInitializeBondOfferBonding({
    bondingType: BondingCurveType.Linear,
    hadoMarket: syntheticOffer.marketPubkey,
    assetReceiver: syntheticOffer.assetReceiver,
    bondOffer: getMockBondOffer().publicKey,
  })

  const updatedBondOffer = optimisticUpdateBondOfferBonding({
    bondOffer: initializedOffer,
    newLoanValue: loanValueInLamports,
    newDelta: deltaValueInLamports,
    newQuantityOfLoans: loansQuantity,
  })

  return updatedBondOffer
}

type ShouldShowDepositError = (props: {
  initialLoanValue?: number
  initialLoansAmount?: number
  solanaBalance: number
  offerSize: number
}) => boolean

export const shouldShowDepositError: ShouldShowDepositError = ({
  initialLoanValue = 0,
  initialLoansAmount = 0,
  solanaBalance,
  offerSize,
}) => {
  const initialOfferSize = initialLoansAmount * initialLoanValue
  const totalAvailableFunds = initialOfferSize + solanaBalance * 1e9

  return totalAvailableFunds < offerSize
}

export const getAdditionalSummaryOfferInfo = (offer?: Offer) => {
  const { concentrationIndex = 0, bidSettlement = 0, buyOrdersQuantity = 0 } = offer || {}

  return {
    accruedInterest: concentrationIndex,
    reserve: bidSettlement,
    activeLoansQuantity: buyOrdersQuantity, //TODO: need calc this value from BE
  }
}

export const checkIsEditMode = (offerPubkey: string) =>
  !!offerPubkey && offerPubkey !== PUBKEY_PLACEHOLDER
