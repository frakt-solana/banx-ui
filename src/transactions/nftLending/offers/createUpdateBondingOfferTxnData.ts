import { BN, web3 } from 'fbonds-core'
import { SANCTUM_PROGRAMM_ID } from 'fbonds-core/lib/fbond-protocol/constants'
import { SwapMode, swapSolToBanxSol } from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BANX_SOL, BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateUpdateBondingOfferTxnData = (params: {
  loanValue: number //? human number
  loansAmount: number
  deltaValue: number //? human number
  offer: core.Offer
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
  const {
    instructions: updateInstructions,
    signers: updateSigners,
    optimisticResult,
  } = await updatePerpetualOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      bondOfferV2: new web3.PublicKey(offer.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
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

  const newOffer = optimisticResult?.bondOffer
  if (!newOffer) {
    throw new Error('Optimistic offer doesnt exist')
  }

  const oldOfferSize = offer.fundsSolOrTokenBalance + offer.bidSettlement + offer.concentrationIndex

  //? Optimistic offer is broken
  const newOfferSize =
    newOffer?.fundsSolOrTokenBalance + newOffer?.bidSettlement + newOffer?.concentrationIndex

  const diff = newOfferSize - oldOfferSize

  const { instructions: swapBanxSolToSolInstructions, signers: swapBanxSolToSolSigners } =
    await swapSolToBanxSol({
      programId: SANCTUM_PROGRAMM_ID,
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        amount: new BN(Math.floor(Math.abs(diff) * BANX_SOL.BANXSOL_TO_SOL_RATIO)),
        banxSolLstIndex: 29,
        wSolLstIndex: 1,
        swapMode: SwapMode.BanxSolToSol,
      },
      sendTxn: sendTxnPlaceHolder,
    })

  const { instructions: swapSolToBanxSolInstructions, signers: swapSolToBanxSolSigners } =
    await swapSolToBanxSol({
      programId: SANCTUM_PROGRAMM_ID,
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        amount: new BN(Math.ceil(Math.abs(diff) / BANX_SOL.SOL_TO_BANXSOL_RATIO)),
        banxSolLstIndex: 29,
        wSolLstIndex: 1,
        swapMode: SwapMode.SolToBanxSol,
      },
      sendTxn: sendTxnPlaceHolder,
    })

  const instructions: web3.TransactionInstruction[] = []
  if (diff > 0) instructions.push(...swapSolToBanxSolInstructions)
  instructions.push(...updateInstructions)
  if (diff < 0) instructions.push(...swapBanxSolToSolInstructions)

  const signers: web3.Signer[] = []
  if (diff > 0) signers.push(...swapSolToBanxSolSigners)
  signers.push(...updateSigners)
  if (diff < 0) signers.push(...swapBanxSolToSolSigners)

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables: [],
  }
}
