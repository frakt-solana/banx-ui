import { BN, web3 } from 'fbonds-core'
import {
  calculateBanxSolStakingRewards,
  claimPerpetualBondOfferInterest,
  claimPerpetualBondOfferRepayments,
  claimPerpetualBondOfferStakingRewards,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
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

import { accountConverterBNAndPublicKey, parseAccountInfoByPubkey } from '../functions'
import { sendTxnPlaceHolder } from '../helpers'

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
  const { repaymentsAmount, interestRewardsAmount, rentRewards, lendingTokenType } = userVault

  const instructionsArray: web3.TransactionInstruction[] = []
  const signersArray: web3.Signer[] = []

  if (repaymentsAmount.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferRepayments({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        lendingTokenType,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  if (interestRewardsAmount.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferInterest({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      args: {
        lendingTokenType,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructionsArray.push(...instructions)
    signersArray.push(...signers)
  }

  if (rentRewards.gt(ZERO_BN)) {
    //TODO: Add rent rewards ixn
  }

  const totalLstYield = isBanxSolTokenType(lendingTokenType)
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

  if (isBanxSolTokenType(lendingTokenType) && totalLstYield.gt(ZERO_BN)) {
    const { instructions, signers } = await claimPerpetualBondOfferStakingRewards({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      connection: walletAndConnection.connection,
      accounts: {
        userPubkey: walletAndConnection.wallet.publicKey,
      },
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
  const results = parseAccountInfoByPubkey(accountInfoByPubkey, accountConverterBNAndPublicKey)

  return results?.['userVault']?.[0] as UserVault
}
