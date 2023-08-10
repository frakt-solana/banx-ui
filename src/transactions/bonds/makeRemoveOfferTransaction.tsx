import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  removePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/bonds'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeRemovePerpetualOfferTransaction = (params: {
  offerPubkey: string
  connection: web3.Connection
  wallet: WalletContextState
  optimisticOffer: Offer | undefined
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
  optimisticResult: BondOfferOptimistic | undefined
}>

export const makeRemovePerpetualOfferTransaction: MakeRemovePerpetualOfferTransaction = async ({
  offerPubkey,
  connection,
  wallet,
  optimisticOffer,
}) => {
  const { instructions, signers, optimisticResult } = await removePerpetualOffer({
    accounts: {
      bondOfferV2: new web3.PublicKey(offerPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    optimistic: { bondOffer: optimisticOffer as BondOfferV2 },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
    optimisticResult,
  }
}
