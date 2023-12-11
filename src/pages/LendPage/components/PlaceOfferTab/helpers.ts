import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  optimisticInitializeBondOfferBonding,
  optimisticUpdateBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

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
  hasFormChanges: boolean
}) => string

const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient balance. Please deposit more SOL.',
  INVALID_OFFER: 'Invalid offer. The initial offer is too low.',
  EMPTY_LOANS_AMOUNT: 'Please enter a valid number of loans. The number of loans cannot be empty.',
}

export const getOfferErrorMessage: GetCreateOfferErrorMessage = ({
  solanaBalance,
  offerSize,
  loanValue,
  loansAmount,
  deltaValue,
  syntheticOffer,
  hasFormChanges,
}) => {
  const initialOfferSize = calculateOfferSize({
    syntheticOffer,
    deltaValue: syntheticOffer.deltaValue / 1e9,
    loanValue: syntheticOffer.loanValue / 1e9,
    loansQuantity: syntheticOffer.loansAmount,
  })

  const totalFundsAvailable = initialOfferSize + solanaBalance * 1e9
  const isBalanceInsufficient = offerSize > totalFundsAvailable

  const isOfferInvalid =
    deltaValue && hasFormChanges ? deltaValue * 1e9 * loansAmount > loanValue * 1e9 : false

  const isEmptyLoansAmount = hasFormChanges && !loansAmount

  const errorConditions: Array<[boolean, string]> = [
    [isEmptyLoansAmount, ERROR_MESSAGES.EMPTY_LOANS_AMOUNT],
    [isBalanceInsufficient, ERROR_MESSAGES.INSUFFICIENT_BALANCE],
    [isOfferInvalid, ERROR_MESSAGES.INVALID_OFFER],
  ]

  const errorMessage = chain(errorConditions)
    .find(([condition]) => condition)
    .thru((error) => (error ? error[1] : ''))
    .value() as string

  return errorMessage
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
