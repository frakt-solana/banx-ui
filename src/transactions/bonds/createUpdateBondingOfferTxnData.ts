import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

type CreateUpdateBondingOfferTxnData = (params: {
  loanValue: number //? human number
  loansAmount: number
  deltaValue: number //? human number
  offer: Offer
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createUpdateBondingOfferTxnData: CreateUpdateBondingOfferTxnData = async ({
  loanValue,
  loansAmount,
  deltaValue,
  offer,
  tokenType,
  walletAndConnection,
}) => {
  const { instructions, signers, optimisticResult } = await updatePerpetualOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      bondOfferV2: new web3.PublicKey(offer.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey as web3.PublicKey,
    },
    optimistic: {
      bondOffer: offer as BondOfferV2,
    },
    args: {
      loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      lendingTokenType: tokenType,
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
