import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, calculateIdleFundsInOffer, removeDuplicatedPublicKeys } from '@banx/utils'

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

  const oldOfferSize = calculateIdleFundsInOffer(offer)

  //? Optimistic offer is broken
  const newOfferSize = calculateIdleFundsInOffer(newOffer)

  const diff = newOfferSize.sub(oldOfferSize)

  const { instructions: swapSolToBanxSolInstructions, lookupTable: swapSolToBanxSolLookupTable } =
    await banxSol.getSwapSolToBanxSolInstructions({
      inputAmount: diff.abs(),
      walletAndConnection,
    })

  const { instructions: swapBanxSolToSolInstructions, lookupTable: swapBanxSolToSolLookupTable } =
    await banxSol.getSwapBanxSolToSolInstructions({
      inputAmount: diff.abs(),
      walletAndConnection,
    })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  //TODO: Refactor
  const instructions: web3.TransactionInstruction[] = []
  if (diff.gt(ZERO_BN)) instructions.push(...swapSolToBanxSolInstructions)
  instructions.push(...updateInstructions)
  if (diff.lt(ZERO_BN)) instructions.push(...swapBanxSolToSolInstructions)
  instructions.push(...closeInstructions)

  const lookupTables: web3.PublicKey[] = []
  if (diff.gt(ZERO_BN)) lookupTables.push(swapSolToBanxSolLookupTable)
  if (diff.lt(ZERO_BN)) lookupTables.push(swapBanxSolToSolLookupTable)
  lookupTables.push(closeLookupTable)

  return {
    instructions,
    signers: updateSigners,
    result: optimisticResult,
    lookupTables: removeDuplicatedPublicKeys(lookupTables),
  }
}
