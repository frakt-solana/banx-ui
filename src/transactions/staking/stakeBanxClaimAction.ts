import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimStakingRewards } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking/claimStakingRewards'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { createPriorityFeesInstruction } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxClaimActionParams = {
  weeks: number[]
}

export type StakeBanxClaimAction = CreateTransactionDataFn<StakeBanxClaimActionParams, null>

export const stakeBanxClaimAction: StakeBanxClaimAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { instructions, signers } = await claimStakingRewards({
    connection,
    addComputeUnits: true,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      weeks: ixnParams.weeks,
    },
    accounts: {
      tokenMint: BANX_TOKEN_MINT,
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const priorityFeeInstruction = await createPriorityFeesInstruction(instructions, connection)

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers,
    lookupTables: [],
  }
}
