import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateMakeBondingOfferTxnData = (params: {
  marketPubkey: string

  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  collateralsPerToken?: number

  bondFeature: BondFeatures
  bondingCurveType: BondingCurveType

  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async ({
  marketPubkey,
  loanValue,
  loansAmount,
  bondingCurveType,
  deltaValue,
  collateralsPerToken = 0,
  bondFeature,
  walletAndConnection,
}) => {
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
      bondFeature,
      collateralsPerToken,
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
