import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxTokenActionParams = {
  userPubkey: web3.PublicKey
  tokensToStake: string
  priorityFees: number
}

export type StakeBanxTokenAction = MakeActionFn<StakeBanxTokenActionParams, null>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (ixnParams, { connection }) => {
  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees: ixnParams.priorityFees,
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
    additionalResult: null,
    signers: signers,
    lookupTables: [],
  }
}
