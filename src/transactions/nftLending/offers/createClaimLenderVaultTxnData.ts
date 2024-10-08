import { BN, web3 } from 'fbonds-core'
import {
  calculateBanxSolStakingRewards,
  claimPerpetualBondOfferInterest,
  claimPerpetualBondOfferRepayments,
  claimPerpetualBondOfferStakingRewards,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { ClusterStats } from '@banx/api/common'
import { UserVault } from '@banx/api/shared'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, isBanxSolTokenType } from '@banx/utils'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateClaimLenderVaultTxnDataParams = {
  userVault: UserVault
  clusterStats: ClusterStats
}

type CreateClaimLenderVaultTxnData = (
  params: CreateClaimLenderVaultTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimLenderVaultTxnDataParams>>

export const createClaimLenderVaultTxnData: CreateClaimLenderVaultTxnData = async (
  params,
  walletAndConnection,
) => {
  const { userVault, clusterStats } = params

  const repaymentsAmount = userVault.repaymentsAmount
  const interestRewardsAmount = userVault.interestRewardsAmount
  const rentRewards = userVault.rentRewards
  const totalLstYield =
    userVault.lendingTokenType === LendingTokenType.BanxSol
      ? calculateBanxSolStakingRewards({
          userVault: params.userVault,
          nowSlot: new BN(clusterStats.slot),
          currentEpochStartAt: new BN(clusterStats.epochStartedAt ?? 0),
        })
      : ZERO_BN

  const totalClaimAmount = repaymentsAmount
    .add(interestRewardsAmount)
    .add(rentRewards)
    .add(totalLstYield)

  const instructionsArray: web3.TransactionInstruction[] = []
  const signersArray: web3.Signer[] = []

  // const accountsParams = {
  //   bondOffer: new web3.PublicKey(offer.publicKey),
  //   userPubkey: walletAndConnection.wallet.publicKey,
  // }

  if (repaymentsAmount.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferRepayments({
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        lendingTokenType: userVault.lendingTokenType,
      },
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  if (interestRewardsAmount.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferInterest({
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        lendingTokenType: userVault.lendingTokenType,
      },
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  if (rentRewards.gt(ZERO_BN)) {
    //TODO: Add rent rewards ixn
  }

  if (isBanxSolTokenType(userVault.lendingTokenType) && totalLstYield.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferStakingRewards({
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  const accounts = [userVault.publicKey]

  if (isBanxSolTokenType(userVault.lendingTokenType) && totalClaimAmount.gt(ZERO_BN)) {
    return await banxSol.combineWithSellBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: totalClaimAmount,
        instructions: instructionsArray,
        signers: signersArray,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions: instructionsArray,
    signers: signersArray,
    lookupTables: [],
  }
}

export const parseClaimLenderVaultSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['userVault']?.[0] as UserVault
}
