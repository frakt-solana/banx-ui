import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondOfferOptimistic,
  removePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
// import { getCloseBanxSolATAsInstructions } from '@banx/transactions/banxSol'
import { ZERO_BN, calculateIdleFundsInOffer, isBanxSolTokenType } from '@banx/utils'

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
      bondOffer: offer,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  const offerSize = calculateIdleFundsInOffer(offer).add(new BN(offer.bidCap))

  if (isBanxSolTokenType(tokenType) && offerSize.gt(ZERO_BN)) {
    return await banxSol.combineWithSellBanxSolInstructions({
      inputAmount: offerSize,
      walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result: optimisticResult,
    })
  }

  // if (offerSize.eq(ZERO_BN)) {
  //   const { instructions: closeInstructions } = await getCloseBanxSolATAsInstructions({
  //     walletAndConnection,
  //   })

  //   instructions.push(...closeInstructions)
  // }

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables,
  }
}
