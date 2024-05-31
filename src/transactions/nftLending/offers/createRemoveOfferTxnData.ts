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
import { calculateIdleFundsInOffer, removeDuplicatedPublicKeys } from '@banx/utils'

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
    instructions: [...removeInstructions, ...swapInstructions, ...closeInstructions],
    signers: removeSigners,
    result: optimisticResult,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      new web3.PublicKey(LOOKUP_TABLE),
      closeLookupTable,
    ]),
  }
}
