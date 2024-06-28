import { BN, web3 } from 'fbonds-core'
import {
  calculateBanxSolStakingRewards,
  claimPerpetualBondOfferInterest,
  claimPerpetualBondOfferRepayments,
  claimPerpetualBondOfferStakingRewards, // claimPerpetualBondOfferStakingRewards,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { ClusterStats } from '@banx/api/common'
import { Offer, core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { ZERO_BN, isBanxSolTokenType } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateClaimLenderVaultTxnData = (params: {
  offer: core.Offer
  tokenType: LendingTokenType
  clusterStats: ClusterStats | undefined
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<Offer>>

export const createClaimLenderVaultTxnData: CreateClaimLenderVaultTxnData = async ({
  offer,
  tokenType,
  clusterStats,
  walletAndConnection,
}) => {
  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  const accountsParams = {
    bondOffer: new web3.PublicKey(offer.publicKey),
    userPubkey: walletAndConnection.wallet.publicKey,
  }

  const optimiticResult = {
    ...offer,
    concentrationIndex: 0,
    bidCap: 0,
    rewardsToHarvest: 0,
    lastCalculatedSlot: 0, //? current epoch * slotsInEpoch
    fundsSolOrTokenBalance: 0,
    bidSettlement: 0,
  }

  if (offer.concentrationIndex) {
    const { instructions: claimInterestInstructions, signers: claimInterestSigners } =
      await claimPerpetualBondOfferInterest({
        accounts: accountsParams,
        optimistic: { bondOffer: offer },
        args: {
          lendingTokenType: tokenType,
        },
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        connection: walletAndConnection.connection,
        sendTxn: sendTxnPlaceHolder,
      })

    instructions.push(...claimInterestInstructions)
    signers.push(...claimInterestSigners)
  }

  if (offer.bidCap || offer.fundsSolOrTokenBalance || offer.bidSettlement) {
    const { instructions: claimRepaymetsInstructions, signers: claimRepaymetsSigners } =
      await claimPerpetualBondOfferRepayments({
        accounts: accountsParams,
        optimistic: { bondOffer: offer },
        args: {
          lendingTokenType: tokenType,
        },
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        connection: walletAndConnection.connection,
        sendTxn: sendTxnPlaceHolder,
      })

    instructions.push(...claimRepaymetsInstructions)
    signers.push(...claimRepaymetsSigners)
  }

  const nowSlot = new BN(clusterStats?.slot || 0)
  const currentEpochStartAt = new BN(clusterStats?.epochStartedAt || 0)

  const calculateLstYield = calculateBanxSolStakingRewards({
    bondOffer: offer,
    nowSlot,
    currentEpochStartAt,
  })

  if (calculateLstYield.gt(ZERO_BN)) {
    const { instructions: claimYieldInstructions, signers: claimYieldSigners } =
      await claimPerpetualBondOfferStakingRewards({
        accounts: accountsParams,
        optimistic: {
          bondOffer: offer,
          nowSlot,
          currentEpochStartAt,
        },
        programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
        connection: walletAndConnection.connection,
        sendTxn: sendTxnPlaceHolder,
      })

    instructions.push(...claimYieldInstructions)
    signers.push(...claimYieldSigners)
  }

  if (isBanxSolTokenType(tokenType) && (offer.bidCap || offer.concentrationIndex)) {
    const inputAmount = new BN(offer.concentrationIndex).add(new BN(offer.bidCap))

    return await banxSol.combineWithSellBanxSolInstructions({
      inputAmount,
      walletAndConnection,
      instructions,
      signers,
      result: optimiticResult,
    })
  }

  return {
    instructions,
    signers,
    result: optimiticResult,
    lookupTables: [],
  }
}
