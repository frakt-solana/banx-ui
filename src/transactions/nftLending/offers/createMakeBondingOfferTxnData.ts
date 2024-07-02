import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from '@banx/../../solana-txn-executor/src'
import { fetchTokenBalance } from '@banx/api/common'
import { BANX_SOL_ADDRESS, BONDS } from '@banx/constants'
import { banxSol, parseBanxAccountInfo } from '@banx/transactions'
import { ZERO_BN, calculateNewOfferSize, isBanxSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateMakeBondingOfferTxnDataParams = {
  marketPubkey: string
  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
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
  const { marketPubkey, loanValue, loansAmount, tokenType, deltaValue } = params

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
      bondFeature: BondFeatures.AutoReceiveAndReceiveNft,
      collateralsPerToken: 0,
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
      //TODO Refactor combineWithBuyBanxSolInstructions for new TxnData type
      const combineWithBuyBanxSolResult = await banxSol.combineWithBuyBanxSolInstructions({
        inputAmount: diff.abs(),
        walletAndConnection,
        instructions,
        signers,
        lookupTables,
        result: optimisticResult,
      })

      return {
        params,
        accounts,
        instructions: combineWithBuyBanxSolResult.instructions,
        signers: combineWithBuyBanxSolResult.signers,
        lookupTables: combineWithBuyBanxSolResult.lookupTables,
      }
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

//TODO Move results logic into shared separate function?
export const parseMakeOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = chain(accountInfoByPubkey)
    .toPairs()
    .filter(([, info]) => !!info)
    .map(([publicKey, info]) => {
      return parseBanxAccountInfo(new web3.PublicKey(publicKey), info)
    })
    .fromPairs()
    .value()

  return results?.['bondOfferV3'] as BondOfferV3
}
