import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondOfferOptimistic,
  removePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  calculateIdleFundsInOffer,
  isBanxSolTokenType,
  removeDuplicatedPublicKeys,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateRemoveOfferTxnDataParams = {
  offer: core.Offer
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}

type CreateRemoveOfferTxnData = (
  params: CreateRemoveOfferTxnDataParams,
) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createRemoveOfferTxnData: CreateRemoveOfferTxnData = async ({
  offer,
  tokenType,
  walletAndConnection,
}) => {
  const { instructions, signers, optimisticResult } = await removePerpetualOffer({
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

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    return await wrapWithBanxSolSwapInstructions({
      offer,
      tokenType,
      walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result: optimisticResult,
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
}: CreateTxnData<BondOfferOptimistic> & CreateRemoveOfferTxnDataParams): Promise<
  CreateTxnData<BondOfferOptimistic>
> => {
  const offerSize = calculateIdleFundsInOffer(offer)

  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await banxSol.getSwapBanxSolToSolInstructions({
      inputAmount: new BN(offerSize),
      walletAndConnection,
    })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  return {
    instructions: [...instructions, ...swapInstructions, ...closeInstructions],
    signers,
    result,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      ...(lookupTables ?? []),
      closeLookupTable,
    ]),
  }
}
