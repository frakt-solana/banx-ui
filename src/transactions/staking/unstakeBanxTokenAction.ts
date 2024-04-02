import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { unstakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { calculatePriorityFees, sendTxnPlaceHolder } from '@banx/utils'

export type UnstakeBanxTokenParams = {
  userPubkey: web3.PublicKey
  tokensToUnstake: string
}

export type UnstakeBanxTokenParamsAction = CreateTransactionDataFn<UnstakeBanxTokenParams, null>

export const unstakeBanxTokenAction: UnstakeBanxTokenParamsAction = async (
  ixnParams,
  { connection },
) => {
  const priorityFees = await calculatePriorityFees(connection)

  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: BANX_TOKEN_MINT,
    },
    priorityFees,
    args: {
      tokensToUnstake: new BN(ixnParams.tokensToUnstake),
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await unstakeBanxToken(params)

  return {
    instructions,
    signers,
    lookupTables: [],
  }
}
