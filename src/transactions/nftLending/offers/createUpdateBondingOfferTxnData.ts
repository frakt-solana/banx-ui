import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  optimisticUpdateBondOfferBonding,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
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
  collateralsPerToken?: number
}

type CreateUpdateBondingOfferTxnData = (
  params: CreateUpdateBondingOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateUpdateBondingOfferTxnDataParams>>

export const createUpdateBondingOfferTxnData: CreateUpdateBondingOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loanValue, loansAmount, deltaValue, offer, tokenType, collateralsPerToken = 0 } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await updatePerpetualOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      bondOfferV2: new web3.PublicKey(offer.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },

    args: {
      loanValue: new BN(loanValue),
      delta: new BN(deltaValue),
      quantityOfLoans: loansAmount,
      lendingTokenType: tokenType,
      collateralsPerToken: new BN(collateralsPerToken),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  const accounts = [accountsCollection['bondOffer']]

  if (isBanxSolTokenType(tokenType)) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const oldOfferSize = calculateIdleFundsInOffer(offer)

    const updatedOffer = optimisticUpdateBondOfferBonding({
      bondOffer: core.convertCoreOfferToBondOfferV3(offer),
      newLoanValue: new BN(loanValue),
      newDelta: new BN(deltaValue),
      newQuantityOfLoans: new BN(loansAmount),
      collateralsPerToken: ZERO_BN,
    })

    //? Optimistic offer is broken
    const updatedOfferSize = calculateIdleFundsInOffer(core.convertBondOfferV3ToCore(updatedOffer))

    const diff = updatedOfferSize.sub(oldOfferSize).sub(banxSolBalance)

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

  return results?.['bondOfferV3'] as core.Offer
}
