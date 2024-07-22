import { BN, web3 } from 'fbonds-core'
import {
  calculateBanxSolStakingRewards,
  claimPerpetualBondOfferInterest,
  claimPerpetualBondOfferRepayments,
  claimPerpetualBondOfferStakingRewards,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { ClusterStats } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { ZERO_BN, isBanxSolTokenType } from '@banx/utils'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateClaimLenderVaultTxnDataParams = {
  offer: core.Offer
  tokenType: LendingTokenType
  clusterStats: ClusterStats | undefined
}

type CreateClaimLenderVaultTxnData = (
  params: CreateClaimLenderVaultTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimLenderVaultTxnDataParams>>

export const createClaimLenderVaultTxnData: CreateClaimLenderVaultTxnData = async (
  params,
  walletAndConnection,
) => {
  const { offer, tokenType, clusterStats } = params

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  const accountsParams = {
    bondOffer: new web3.PublicKey(offer.publicKey),
    userPubkey: walletAndConnection.wallet.publicKey,
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

  if (isBanxSolTokenType(tokenType) && calculateLstYield.gt(ZERO_BN)) {
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

  const accounts = [new web3.PublicKey(offer.publicKey)]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [],
  }
}

export const parseClaimLenderVaultSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondOfferV3'] as BondOfferV3
}
