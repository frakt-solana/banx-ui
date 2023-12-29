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
  loansAmount: number //? integer number
  syntheticOffer: SyntheticOffer
}) => BondOfferV2

export const getUpdatedBondOffer: GetUpdatedBondOffer = ({
  loanValue,
  deltaValue,
  loansAmount,
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
    newQuantityOfLoans: loansAmount,
  })

  return updatedBondOffer
}

type GetErrorMessage = (props: {
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
  INVALID_OFFER:
    'Max Offer must be equal to or greater than the Delta multiplied by the Number of offers.',
  EMPTY_LOANS_AMOUNT: 'Please enter a valid number of loans. The number of loans cannot be empty.',
}

export const getErrorMessage: GetErrorMessage = ({
  solanaBalance,
  offerSize,
  loanValue,
  loansAmount,
  deltaValue,
  syntheticOffer,
  hasFormChanges,
}) => {
  const initialOfferSize = calcOfferSize({
    syntheticOffer,
    deltaValue: syntheticOffer.deltaValue,
    loanValue: syntheticOffer.loanValue,
    loansAmount: syntheticOffer.loansAmount,
  })

  const totalFundsAvailable = initialOfferSize + solanaBalance * 1e9

  const isOfferInvalid = deltaValue && hasFormChanges ? deltaValue * loansAmount > loanValue : false
  const isBalanceInsufficient = !!solanaBalance && offerSize > totalFundsAvailable
  const isEmptyLoansAmount = hasFormChanges && !loansAmount

  const errorConditions: Array<[boolean, string]> = [
    [isOfferInvalid, ERROR_MESSAGES.INVALID_OFFER],
    [isBalanceInsufficient, ERROR_MESSAGES.INSUFFICIENT_BALANCE],
    [isEmptyLoansAmount, ERROR_MESSAGES.EMPTY_LOANS_AMOUNT],
  ]

  const errorMessage = chain(errorConditions)
    .find(([condition]) => condition)
    .thru((error) => (error ? error[1] : ''))
    .value() as string

  return errorMessage
}

export const checkIsEditMode = (offerPubkey: string) =>
  !!offerPubkey && offerPubkey !== PUBKEY_PLACEHOLDER

type CalcOfferSize = (props: {
  syntheticOffer: SyntheticOffer
  loanValue: number //? lamports
  deltaValue: number //? lamports
  loansAmount: number
}) => number

export const calcOfferSize: CalcOfferSize = ({
  syntheticOffer,
  loanValue,
  loansAmount,
  deltaValue,
}) => {
  const offerToUpdate = { loanValue, deltaValue, loansAmount, syntheticOffer }
  const updatedBondOffer = getUpdatedBondOffer(offerToUpdate)

  const offerSize = updatedBondOffer.fundsSolOrTokenBalance + updatedBondOffer.bidSettlement
  return offerSize
}

type CalcBestOfferValue = (props: {
  solanaBalance: number //? normal number
  bestOffer: number //? lamports
}) => number

const TRANSACTION_FEE_IN_LAMPORTS = 0.01 * 1e9 //? transaction fee for prevent any case with not enough sol

export const calcBestOfferValue: CalcBestOfferValue = ({ solanaBalance, bestOffer }) => {
  const balanceAfterDeductingFee = Math.max(solanaBalance * 1e9 - TRANSACTION_FEE_IN_LAMPORTS, 0)
  return Math.min(balanceAfterDeductingFee, bestOffer) || 0
}
