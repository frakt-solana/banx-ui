import { BN, web3 } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  getBondingCurveTypeFromLendingToken,
  optimisticInitializeBondOfferBonding,
  optimisticUpdateBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import { core } from '@banx/api/nft'
import { SyntheticOffer } from '@banx/store/nft'
import { ZERO_BN } from '@banx/utils'

type GetUpdatedBondOffer = (props: {
  loanValue: number //? lamports
  deltaValue: number //? lamports
  loansAmount: number //? integer number
  syntheticOffer: SyntheticOffer
  tokenType: LendingTokenType
}) => core.Offer

export const getUpdatedBondOffer: GetUpdatedBondOffer = ({
  loanValue,
  deltaValue,
  loansAmount,
  syntheticOffer,
  tokenType,
}) => {
  const initializedOffer = optimisticInitializeBondOfferBonding({
    bondingType: getBondingCurveTypeFromLendingToken(tokenType),
    hadoMarket: new web3.PublicKey(syntheticOffer.marketPubkey),
    assetReceiver: new web3.PublicKey(syntheticOffer.assetReceiver),
    bondOffer: getMockBondOffer().publicKey,
    isSplFeature: false,
  })

  const updatedBondOffer = optimisticUpdateBondOfferBonding({
    bondOffer: initializedOffer,
    newLoanValue: new BN(loanValue),
    newDelta: new BN(deltaValue),
    newQuantityOfLoans: new BN(loansAmount),
    collateralsPerToken: ZERO_BN,
    tokenLendingApr: ZERO_BN,
  })

  return core.convertBondOfferV3ToCore(updatedBondOffer)
}

type GetErrorMessage = (props: {
  syntheticOffer: SyntheticOffer
  walletBalance: number
  escrowBalance: number
  offerSize: number
  loanValue: number
  loansAmount: number
  deltaValue: number
  hasFormChanges: boolean
  tokenType: LendingTokenType
}) => string

const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: {
    [LendingTokenType.NativeSol]: 'Not enough SOL',
    [LendingTokenType.Usdc]: 'Not enough USDC',
    [LendingTokenType.BanxSol]: 'Not enough SOL',
  },
  INVALID_OFFER: 'Offer imbalance. Increase Max Offer, or reduce Delta and/or Number of Offers',
  EMPTY_LOANS_AMOUNT: 'Please enter a valid number of loans. The number of loans cannot be empty',
}

export const getErrorMessage: GetErrorMessage = ({
  walletBalance,
  escrowBalance,
  offerSize,
  loanValue,
  loansAmount,
  deltaValue,
  syntheticOffer,
  hasFormChanges,
  tokenType,
}) => {
  const initialOfferSize = calcOfferSize({
    syntheticOffer,
    deltaValue: syntheticOffer.deltaValue,
    loanValue: syntheticOffer.loanValue,
    loansAmount: syntheticOffer.loansAmount,
    tokenType,
  })

  const totalFundsAvailable = initialOfferSize + walletBalance + escrowBalance

  const isOfferInvalid = deltaValue && hasFormChanges ? deltaValue * loansAmount > loanValue : false
  const isBalanceInsufficient = !!walletBalance && offerSize > totalFundsAvailable
  const isEmptyLoansAmount = hasFormChanges && !loansAmount

  const errorConditions: Array<[boolean, string]> = [
    [isOfferInvalid, ERROR_MESSAGES.INVALID_OFFER],
    [isBalanceInsufficient, ERROR_MESSAGES.INSUFFICIENT_BALANCE[tokenType]],
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
  tokenType: LendingTokenType
}) => number

export const calcOfferSize: CalcOfferSize = ({
  syntheticOffer,
  loanValue,
  loansAmount,
  deltaValue,
  tokenType,
}) => {
  const offerToUpdate = { loanValue, deltaValue, loansAmount, syntheticOffer, tokenType }
  const updatedBondOffer = getUpdatedBondOffer(offerToUpdate)

  const offerSize = updatedBondOffer.fundsSolOrTokenBalance + updatedBondOffer.bidSettlement
  return offerSize
}
