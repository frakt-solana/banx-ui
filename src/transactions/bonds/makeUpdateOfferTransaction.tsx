import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/bonds'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeUpdatePerpetualOfferTransaction = (params: {
  offerPubkey: string
  loanValue: number
  loansAmount: number
  connection: web3.Connection
  wallet: WalletContextState
  optimisticOffer?: Offer | null
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
  optimisticResult: BondOfferOptimistic | undefined
}>

export const makeUpdatePerpetualOfferTransaction: MakeUpdatePerpetualOfferTransaction = async ({
  loanValue,
  loansAmount,
  offerPubkey,
  connection,
  optimisticOffer,
  wallet,
}) => {
  const bondOfferV2 = new web3.PublicKey(offerPubkey)
  const userPubkey = wallet.publicKey as web3.PublicKey

  console.log({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: { bondOfferV2, userPubkey },
    args: { loanValue: loanValue * 1e9, amountOfLoans: loansAmount },
    optimistic: { bondOffer: optimisticOffer as BondOfferV2 },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })
  const { instructions, signers, optimisticResult } = await updatePerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: { bondOfferV2, userPubkey },
    args: { loanValue: loanValue * 1e9, amountOfLoans: loansAmount },
    optimistic: { bondOffer: optimisticOffer as BondOfferV2 },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  console.log(optimisticResult, 'optimisticResult')

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers: [...signers],
    optimisticResult,
  }
}
