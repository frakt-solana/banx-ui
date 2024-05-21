import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { isSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateMakeBondingOfferTxnData = (params: {
  marketPubkey: string
  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async ({
  marketPubkey,
  loanValue,
  loansAmount,
  tokenType,
  deltaValue,
  walletAndConnection,
}) => {
  const bondingCurveType = isSolTokenType(tokenType)
    ? BondingCurveType.Linear
    : BondingCurveType.LinearUsdc

  const { instructions, signers, optimisticResult } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      bondingCurveType,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables: [],
  }
}
