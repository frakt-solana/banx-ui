import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  optimisticInitializeBondOfferBonding,
  optimisticUpdateBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'
import { SyntheticOffer } from '@banx/store'

type GetUpdatedBondOffer = (props: {
  loanValue: number //? lamports
  deltaValue: number //? lamports
  loansQuantity: number //? integer number
  syntheticOffer: SyntheticOffer
}) => BondOfferV2

export const getUpdatedBondOffer: GetUpdatedBondOffer = ({
  loanValue,
  deltaValue,
  loansQuantity,
  syntheticOffer,
}) => {
  const initializedOffer = optimisticInitializeBondOfferBonding({
    bondingType: BondingCurveType.Linear,
    hadoMarket: syntheticOffer.marketPubkey,
    assetReceiver: syntheticOffer.assetReceiver,
    bondOffer: getMockBondOffer().publicKey,
  })

  const updatedBondOffer = optimisticUpdateBondOfferBonding({
    bondOffer: initializedOffer,
    newLoanValue: loanValue,
    newDelta: deltaValue,
    newQuantityOfLoans: loansQuantity,
  })

  return updatedBondOffer
}

type GetCreateOfferErrorMessage = (props: {
  syntheticOffer: SyntheticOffer
  solanaBalance: number
  offerSize: number
  loanValue: number
  loansAmount: number
  deltaValue: number
}) => string

const ERROR_MESSAGES = {
  insufficientBalance: 'Insufficient balance. Please deposit more SOL.',
  invalidOffer: 'Invalid offer. The offer size is too high.',
}

export const getOfferErrorMessage: GetCreateOfferErrorMessage = ({
  solanaBalance,
  offerSize,
  loanValue,
  loansAmount,
  deltaValue,
  syntheticOffer,
}) => {
  const initialOfferSize = calculateOfferSize({
    syntheticOffer,
    deltaValue: syntheticOffer.deltaValue / 1e9,
    loanValue: syntheticOffer.loanValue / 1e9,
    loansQuantity: syntheticOffer.loansAmount,
  })

  const totalFundsAvailable = initialOfferSize + solanaBalance * 1e9
  const isBalanceInsufficient = offerSize > totalFundsAvailable

  const isOfferInvalid = deltaValue ? deltaValue * loansAmount > loanValue : false

  return (
    (isBalanceInsufficient && ERROR_MESSAGES.insufficientBalance) ||
    (isOfferInvalid && ERROR_MESSAGES.invalidOffer) ||
    ''
  )
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

type CalculateOfferSize = (props: {
  syntheticOffer: SyntheticOffer
  loanValue: number //? normal number
  deltaValue: number //? normal number
  loansQuantity: number
}) => number
export const calculateOfferSize: CalculateOfferSize = ({
  syntheticOffer,
  loanValue,
  loansQuantity,
  deltaValue,
}) => {
  const formattedDeltaValue = deltaValue * 1e9
  const formattedLoanValue = loanValue * 1e9

  const updatedBondOffer = getUpdatedBondOffer({
    loanValue: formattedLoanValue,
    deltaValue: formattedDeltaValue,
    loansQuantity,
    syntheticOffer,
  })

  const offerSize = updatedBondOffer.fundsSolOrTokenBalance
  return offerSize
}

const TRANSACTION_FEE_IN_SOL = 0.01 //? transaction fee for prevent any case with not enough sol
export const calculateBestLoanValue = (solanaBalance: number, bestOffer: number) => {
  const balanceAfterDeductingFee = solanaBalance - TRANSACTION_FEE_IN_SOL
  const maxLoanValue = Math.max(balanceAfterDeductingFee, 0)

  const bestOfferInSol = bestOffer / 1e9
  const bestLoanValue = Math.min(maxLoanValue, bestOfferInSol) || 0
  return bestLoanValue
}
