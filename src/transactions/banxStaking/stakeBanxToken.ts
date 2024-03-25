import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxTokenActionParams = {
  userPubkey: web3.PublicKey
  tokensToStake: number
  optimistic: BanxSubscribeAdventureOptimistic
  priorityFees: number
}

export type StakeBanxTokenAction = MakeActionFn<
  StakeBanxTokenActionParams,
  BanxSubscribeAdventureOptimistic
>

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
      tokensToStake: ixnParams.tokensToStake,
    },
    optimistics: ixnParams.optimistic,
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, optimisticResult, signers } = await stakeBanxToken(params)

  return {
    instructions: instructions,
    signers: signers,
    additionalResult: optimisticResult,
    lookupTables: [],
  }
}
