import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { createPriorityFeesInstruction } from '../helpers'

export type StakeBanxTokenActionParams = {
  tokensToStake: BN
}

export type StakeBanxTokenAction = CreateTransactionDataFn<StakeBanxTokenActionParams, null>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const params = {
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees: 0,
    accounts: {
      userPubkey: wallet.publicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake: ixnParams.tokensToStake,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await stakeBanxToken(params)

  const priorityFeeInstruction = await createPriorityFeesInstruction(instructions, connection)

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers,
    lookupTables: [],
  }
}
