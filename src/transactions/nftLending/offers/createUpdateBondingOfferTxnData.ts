import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, calculateIdleFundsInOffer, isBanxSolTokenType } from '@banx/utils'

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
      bondOffer: offer,
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
    const oldOfferSize = calculateIdleFundsInOffer(offer)

    const newOffer = optimisticResult?.bondOffer
    if (!newOffer) {
      throw new Error('Optimistic offer doesnt exist')
    }
    //? Optimistic offer is broken
    const newOfferSize = calculateIdleFundsInOffer(newOffer)

    const diff = newOfferSize.sub(oldOfferSize)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithSellBanxSolInstructions({
        inputAmount: diff.abs(),
        walletAndConnection,
        instructions,
        signers,
        lookupTables,
        result: optimisticResult,
      })
    }

    return await banxSol.combineWithBuyBanxSolInstructions({
      inputAmount: diff.abs(),
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
