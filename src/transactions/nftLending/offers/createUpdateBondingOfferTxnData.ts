import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { updatePerpetualOfferBonding } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { fetchTokenBalance } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BANX_SOL_ADDRESS, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, calculateIdleFundsInOffer, isBanxSolTokenType } from '@banx/utils'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateUpdateBondingOfferTxnDataParams = {
  loanValue: number //? human number
  loansAmount: number
  deltaValue: number //? human number
  offer: core.Offer
  tokenType: LendingTokenType
}

type CreateUpdateBondingOfferTxnData = (
  params: CreateUpdateBondingOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateUpdateBondingOfferTxnDataParams>>

export const createUpdateBondingOfferTxnData: CreateUpdateBondingOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loanValue, loansAmount, deltaValue, offer, tokenType } = params

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

  const accounts = [new web3.PublicKey(offer.publicKey)]

  if (isBanxSolTokenType(tokenType)) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const oldOfferSize = calculateIdleFundsInOffer(offer)

    const newOffer = optimisticResult?.bondOffer
    if (!newOffer) {
      throw new Error('Optimistic offer doesnt exist')
    }
    //? Optimistic offer is broken
    const newOfferSize = calculateIdleFundsInOffer(newOffer)

    const diff = newOfferSize.sub(oldOfferSize).sub(banxSolBalance)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithBuyBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff.abs(),
          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }

    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: diff.abs(),

        instructions,
        signers,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

export const parseUpdateOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondOfferV3'] as BondOfferV3
}
