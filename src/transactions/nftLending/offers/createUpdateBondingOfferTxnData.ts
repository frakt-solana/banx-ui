import { BN, web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { removeDuplicatedPublicKeys } from '@banx/utils'

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

  const { instructions: swapSolToBanxSolInstructions, lookupTable: swapSolToBanxSolLookupTable } =
    await banxSol.getSwapSolToBanxSolInstructions({
      inputAmount: new BN(Math.abs(diff)),
      walletAndConnection,
    })

  const { instructions: swapBanxSolToSolInstructions, lookupTable: swapBanxSolToSolLookupTable } =
    await banxSol.getSwapBanxSolToSolInstructions({
      inputAmount: new BN(Math.abs(diff)),
      walletAndConnection,
    })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  //TODO: Refactor
  const instructions: web3.TransactionInstruction[] = []
  if (diff > 0) instructions.push(...swapSolToBanxSolInstructions)
  instructions.push(...updateInstructions)
  if (diff < 0) instructions.push(...swapBanxSolToSolInstructions)
  instructions.push(...closeInstructions)

  const lookupTables: web3.PublicKey[] = []
  if (diff > 0) lookupTables.push(swapSolToBanxSolLookupTable)
  if (diff < 0) lookupTables.push(swapBanxSolToSolLookupTable)
  lookupTables.push(closeLookupTable)

  return {
    instructions,
    signers: updateSigners,
    result: optimisticResult,
    lookupTables: removeDuplicatedPublicKeys(lookupTables),
  }
}
