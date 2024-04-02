import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { calculatePriorityFees, sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxTokenActionParams = {
  userPubkey: web3.PublicKey
  tokensToStake: string
}

export type StakeBanxTokenAction = CreateTransactionDataFn<StakeBanxTokenActionParams, null>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (ixnParams, { connection }) => {
  const priorityFees = await calculatePriorityFees(connection)

  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees,
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake: new BN(ixnParams.tokensToStake),
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await stakeBanxToken(params)

  return {
    instructions: instructions,
    signers: signers,
    lookupTables: [],
  }
}
