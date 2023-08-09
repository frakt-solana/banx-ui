import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { removePerpetualOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeRemovePerpetualOfferTransaction = (params: {
  pairPubkey: string
  connection: web3.Connection
  wallet: WalletContextState
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeRemovePerpetualOfferTransaction: MakeRemovePerpetualOfferTransaction = async ({
  pairPubkey,
  connection,
  wallet,
}) => {
  const { instructions, signers } = await removePerpetualOffer({
    accounts: {
      bondOfferV2: new web3.PublicKey(pairPubkey),
      userPubkey: wallet.publicKey as any,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
  }
}
