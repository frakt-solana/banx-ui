import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  depositToPerpetualOffer,
  updatePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeUpdatePerpetualOfferTransaction = (params: {
  offerPubkey: string
  loansAmount: number
  loanValue: number
  connection: web3.Connection
  wallet: WalletContextState
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeUpdatePerpetualOfferTransaction: MakeUpdatePerpetualOfferTransaction = async ({
  loanValue,
  loansAmount,
  offerPubkey,
  connection,
  wallet,
}) => {
  const bondOfferV2 = new web3.PublicKey(offerPubkey)
  const userPubkey = wallet.publicKey as web3.PublicKey

  const loanToValueFilter = loanValue * 1e9
  const amountOfSolToDeposit = loanValue * loansAmount * 1e9

  const updatePerpetualOfferResult = await updatePerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: { bondOfferV2, userPubkey },
    args: { loanToValueFilter },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const depositToPerpetualOfferResult = await depositToPerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: { bondOfferV2, userPubkey },
    args: { amountOfSolToDeposit },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const instructionsToCombine = [
    ...updatePerpetualOfferResult.instructions,
    ...depositToPerpetualOfferResult.instructions,
  ]

  return {
    transaction: new web3.Transaction().add(...instructionsToCombine),
    signers: [...updatePerpetualOfferResult.signers, ...depositToPerpetualOfferResult.signers],
  }
}
