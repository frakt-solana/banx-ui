import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  ZERO_BN,
  calculateIdleFundsInOffer,
  isBanxSolTokenType,
  removeDuplicatedPublicKeys,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateUpdateBondingOfferTxnDataParams = {
  loanValue: number //? human number
  loansAmount: number
  deltaValue: number //? human number
  offer: core.Offer
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}

type CreateUpdateBondingOfferTxnData = (
  params: CreateUpdateBondingOfferTxnDataParams,
) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createUpdateBondingOfferTxnData: CreateUpdateBondingOfferTxnData = async ({
  loanValue,
  loansAmount,
  deltaValue,
  offer,
  tokenType,
  walletAndConnection,
}) => {
  const { instructions, signers, optimisticResult } = await updatePerpetualOfferBonding({
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

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    return await wrapWithBanxSolSwapInstructions({
      loanValue,
      loansAmount,
      deltaValue,
      offer,
      tokenType,
      walletAndConnection,
      instructions,
      lookupTables,
      result: optimisticResult,
      signers,
    })
  }

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables,
  }
}

const wrapWithBanxSolSwapInstructions = async ({
  offer,
  instructions,
  lookupTables,
  result,
  signers,
  walletAndConnection,
}: CreateTxnData<BondOfferOptimistic> & CreateUpdateBondingOfferTxnDataParams): Promise<
  CreateTxnData<BondOfferOptimistic>
> => {
  const oldOfferSize = calculateIdleFundsInOffer(offer)

  const newOffer = result?.bondOffer
  if (!newOffer) {
    throw new Error('Optimistic offer doesnt exist')
  }

  //? Optimistic offer is broken
  const newOfferSize = calculateIdleFundsInOffer(newOffer)

  const diff = newOfferSize.sub(oldOfferSize)

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  if (diff.gt(ZERO_BN)) {
    const { instructions: swapSolToBanxSolInstructions, lookupTable: swapSolToBanxSolLookupTable } =
      await banxSol.getSwapSolToBanxSolInstructions({
        inputAmount: diff.abs(),
        walletAndConnection,
      })

    return {
      instructions: [...swapSolToBanxSolInstructions, ...instructions, ...closeInstructions],
      signers,
      result,
      lookupTables: removeDuplicatedPublicKeys([
        swapSolToBanxSolLookupTable,
        ...(lookupTables ?? []),
        closeLookupTable,
      ]),
    }
  }

  if (diff.lt(ZERO_BN)) {
    const { instructions: swapBanxSolToSolInstructions, lookupTable: swapBanxSolToSolLookupTable } =
      await banxSol.getSwapBanxSolToSolInstructions({
        inputAmount: diff.abs(),
        walletAndConnection,
      })

    return {
      instructions: [...instructions, ...swapBanxSolToSolInstructions, ...closeInstructions],
      signers,
      result,
      lookupTables: removeDuplicatedPublicKeys([
        ...(lookupTables ?? []),
        swapBanxSolToSolLookupTable,
        closeLookupTable,
      ]),
    }
  }

  return {
    instructions,
    signers,
    result,
    lookupTables,
  }
}
