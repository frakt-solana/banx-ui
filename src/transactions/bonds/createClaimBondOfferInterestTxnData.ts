import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  claimPerpetualBondOfferInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

type CreateClaimBondOfferInterestTxnData = (params: {
  offer: Offer
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createClaimBondOfferInterestTxnData: CreateClaimBondOfferInterestTxnData = async ({
  offer,
  walletAndConnection,
}) => {
  const { instructions, signers, optimisticResult } = await claimPerpetualBondOfferInterest({
    accounts: {
      bondOffer: new web3.PublicKey(offer.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    optimistic: {
      bondOffer: offer as BondOfferV2,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables: [],
  }
}
