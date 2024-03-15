import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

type Params = Parameters<typeof stakeBanxToken>[0]

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

export const stakeBanxTokenAction: StakeBanxTokenAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const params: Params = {
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

  const r = await stakeBanxToken(params)

  return {
    instructions: r.instructions,
    signers: [],
    additionalResult: r.optimisticResult,
    lookupTables: [],
  }
}
