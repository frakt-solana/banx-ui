import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { removePerpetualOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol, parseBanxAccountInfo } from '@banx/transactions'
// import { getCloseBanxSolATAsInstructions } from '@banx/transactions/banxSol'
import { ZERO_BN, calculateIdleFundsInOffer, isBanxSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateRemoveOfferTxnDataParams = {
  offer: core.Offer
  tokenType: LendingTokenType
}

type CreateRemoveOfferTxnData = (
  params: CreateRemoveOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRemoveOfferTxnDataParams>>

export const createRemoveOfferTxnData: CreateRemoveOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const { offer, tokenType } = params

  const { instructions, signers } = await removePerpetualOffer({
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
  const accounts = [new web3.PublicKey(offer.publicKey)]

  const offerSize = calculateIdleFundsInOffer(offer).add(new BN(offer.bidCap))

  if (isBanxSolTokenType(tokenType) && offerSize.gt(ZERO_BN)) {
    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: offerSize,

        instructions,
        signers,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  // if (offerSize.eq(ZERO_BN)) {
  //   const { instructions: closeInstructions } = await getCloseBanxSolATAsInstructions({
  //     walletAndConnection,
  //   })

  //   instructions.push(...closeInstructions)
  // }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

//TODO Move results logic into shared separate function?
export const parseRemoveOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = chain(accountInfoByPubkey)
    .toPairs()
    .filter(([, info]) => !!info)
    .map(([publicKey, info]) => {
      return parseBanxAccountInfo(new web3.PublicKey(publicKey), info)
    })
    .fromPairs()
    .value()

  return results?.['bondOfferV3'] as BondOfferV3
}
