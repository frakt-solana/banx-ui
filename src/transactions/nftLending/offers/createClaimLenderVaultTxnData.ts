import { web3 } from 'fbonds-core'
import {
  claimPerpetualBondOfferInterest,
  claimPerpetualBondOfferRepayments,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer, core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateClaimLenderVaultTxnData = (params: {
  offer: core.Offer
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<Offer>>

export const createClaimLenderVaultTxnData: CreateClaimLenderVaultTxnData = async ({
  offer,
  tokenType,
  walletAndConnection,
}) => {
  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  const accountsParams = {
    bondOffer: new web3.PublicKey(offer.publicKey),
    userPubkey: walletAndConnection.wallet.publicKey,
  }

  if (offer.concentrationIndex) {
    const { instructions: claimInterestInstructions, signers: claimInterestSigners } =
      await claimPerpetualBondOfferInterest({
        accounts: accountsParams,
        optimistic: { bondOffer: offer },
        args: {
          lendingTokenType: tokenType,
        },
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        connection: walletAndConnection.connection,
        sendTxn: sendTxnPlaceHolder,
      })

    instructions.push(...claimInterestInstructions)
    signers.push(...claimInterestSigners)
  }

  if (offer.bidCap) {
    const { instructions: claimRepaymetsInstructions, signers: claimRepaymetsSigners } =
      await claimPerpetualBondOfferRepayments({
        accounts: accountsParams,
        optimistic: { bondOffer: offer },
        args: {
          lendingTokenType: tokenType,
        },
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        connection: walletAndConnection.connection,
        sendTxn: sendTxnPlaceHolder,
      })

    instructions.push(...claimRepaymetsInstructions)
    signers.push(...claimRepaymetsSigners)
  }

  const optimiticResult = {
    ...offer,
    concentrationIndex: 0,
    bidCap: 0,
  }

  return {
    instructions,
    signers,
    result: optimiticResult,
    lookupTables: [],
  }
}
