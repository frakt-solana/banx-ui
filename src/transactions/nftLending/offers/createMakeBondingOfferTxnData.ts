import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { fetchTokenBalance } from '@banx/api/common'
import { BANX_SOL_ADDRESS, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, calculateNewOfferSize, isBanxSolTokenType } from '@banx/utils'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateMakeBondingOfferTxnDataParams = {
  marketPubkey: string

  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  collateralsPerToken?: number

  bondFeature: BondFeatures
  tokenType: LendingTokenType
}

type CreateMakeBondingOfferTxnData = (
  params: CreateMakeBondingOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateMakeBondingOfferTxnDataParams>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const {
    marketPubkey,
    loanValue,
    loansAmount,
    tokenType,
    collateralsPerToken = 0,
    bondFeature,
    deltaValue,
  } = params

  const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

  const { instructions, signers, optimisticResult } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue: loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      bondingCurveType,
      bondFeature,
      collateralsPerToken,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]
  const accounts = [new web3.PublicKey(optimisticResult.bondOffer.publicKey)]

  if (isBanxSolTokenType(tokenType)) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const offerSize = calculateNewOfferSize({ loanValue, loansAmount, deltaValue })
    const diff = offerSize.sub(banxSolBalance)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithBuyBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff.abs(),

          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

export const parseMakeOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondOfferV3'] as BondOfferV3
}
