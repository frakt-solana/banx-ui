import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimStakingRewards } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking/claimStakingRewards'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxClaimActionParams = {
  weeks: number[]
  priorityFees: number
}

export type StakeBanxClaimAction = CreateTransactionDataFn<StakeBanxClaimActionParams, null>

export const stakeBanxClaimAction: StakeBanxClaimAction = async (
  ixnParams,
  { connection, wallet },
) => {
  if (!wallet.publicKey?.toBase58()) {
    throw 'Wallet not connected!'
  }

  const params = {
    connection: connection,
    addComputeUnits: true,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees: ixnParams.priorityFees,
    args: {
      weeks: ixnParams.weeks,
    },
    accounts: {
      tokenMint: BANX_TOKEN_MINT,
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await claimStakingRewards(params)
  return {
    instructions: instructions,
    signers: signers,
    lookupTables: [],
  }
}
