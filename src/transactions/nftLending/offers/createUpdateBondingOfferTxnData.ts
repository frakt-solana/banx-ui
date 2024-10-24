import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  optimisticUpdateBondOfferBonding,
  updateLiquidityToUserVault,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
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

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateUpdateBondingOfferTxnDataParams = {
  loanValue: number //? human number
  loansAmount: number
  deltaValue: number //? human number
  offer: core.Offer
  tokenType: LendingTokenType
  collateralsPerToken?: BN
  tokenLendingApr?: number

  escrowBalance: BN | undefined
  depositAmountToVault?: BN
}

type CreateUpdateBondingOfferTxnData = (
  params: CreateUpdateBondingOfferTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateUpdateBondingOfferTxnDataParams>>

export const createUpdateBondingOfferTxnData: CreateUpdateBondingOfferTxnData = async (
  params,
  walletAndConnection,
) => {
  const {
    loanValue,
    loansAmount,
    deltaValue,
    offer,
    tokenType,
    tokenLendingApr = 0,
    collateralsPerToken = ZERO_BN,
    escrowBalance = ZERO_BN,
    depositAmountToVault = ZERO_BN,
  } = params

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  if (!depositAmountToVault.isZero()) {
    const updateVaultIxns = await updateLiquidityToUserVault({
      connection: walletAndConnection.connection,
      args: {
        amount: depositAmountToVault,
        lendingTokenType: tokenType,
        add: true,
      },
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...updateVaultIxns.instructions)
    signers.push(...updateVaultIxns.signers)
  }

  const updateOfferIxns = await updatePerpetualOfferBonding({
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
      tokenLendingApr: new BN(tokenLendingApr),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...updateOfferIxns.instructions)
  signers.push(...updateOfferIxns.signers)

  const accounts = [updateOfferIxns.accounts['bondOffer']]
  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const updatedOffer = optimisticUpdateBondOfferBonding({
      bondOffer: core.convertCoreOfferToBondOfferV3(offer),
      newLoanValue: new BN(loanValue),
      newDelta: new BN(deltaValue),
      newQuantityOfLoans: new BN(loansAmount),
      collateralsPerToken,
      tokenLendingApr: new BN(tokenLendingApr),
    })

    //? Optimistic offer is broken
    const updatedOfferSize = calculateIdleFundsInOffer(core.convertBondOfferV3ToCore(updatedOffer))

    const diff = updatedOfferSize.sub(banxSolBalance).sub(escrowBalance)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithBuyBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff,
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

  return results?.['bondOfferV3']?.[0] as core.Offer
}

export const parseUpdateTokenOfferSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['bondOfferV3']?.[0] as BondOfferV3
}
