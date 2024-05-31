import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  SwapMode,
  closeTokenAccountBanxSol,
  swapSolToBanxSol,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import {
  BondOfferOptimistic,
  removePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BANX_SOL, BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateRemoveOfferTxnData = (params: {
  offer: core.Offer
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createRemoveOfferTxnData: CreateRemoveOfferTxnData = async ({
  offer,
  tokenType,
  walletAndConnection,
}) => {
  const {
    instructions: removeInstructions,
    signers: removeSigners,
    optimisticResult,
  } = await removePerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOfferV2: new web3.PublicKey(offer.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      lendingTokenType: tokenType,
    },
    optimistic: {
      bondOffer: offer as BondOfferV2,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const offerSize = offer.fundsSolOrTokenBalance + offer.bidSettlement + offer.concentrationIndex

  const { instructions: swapInstructions, signers: swapSigners } = await swapSolToBanxSol({
    programId: SANCTUM_PROGRAMM_ID,
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      amount: new BN(Math.floor(offerSize * BANX_SOL.BANXSOL_TO_SOL_RATIO)),
      banxSolLstIndex: 29,
      wSolLstIndex: 1,
      swapMode: SwapMode.BanxSolToSol,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const { instructions: closeInstructions, signers: closeSigners } = await closeTokenAccountBanxSol(
    {
      connection: walletAndConnection.connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        feeReciver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    },
  )

  return {
    instructions: [...removeInstructions, ...swapInstructions, ...closeInstructions],
    signers: [...removeSigners, ...swapSigners, ...closeSigners],
    result: optimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
