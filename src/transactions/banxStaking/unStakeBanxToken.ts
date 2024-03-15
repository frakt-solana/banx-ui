import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { unstakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

type Params = Parameters<typeof unstakeBanxToken>[0]

export type StakeBanxTokenActionParams = {
  userPubkey: web3.PublicKey
  tokensToUnstake: number
  optimistic: BanxSubscribeAdventureOptimistic
  priorityFees: number
}

export type StakeBanxTokenAction = MakeActionFn<
  StakeBanxTokenActionParams,
  BanxSubscribeAdventureOptimistic
>

export const unStakeBanxTokenAction: StakeBanxTokenAction = async (ixnParams, { connection }) => {
  const params: Params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: BANX_TOKEN_MINT,
    },
    priorityFees: ixnParams.priorityFees,
    args: {
      tokensToUnstake: ixnParams.tokensToUnstake,
    },
    optimistics: {
      banxSubscribeAdventureOptimistic: ixnParams.optimistic,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const r = await unstakeBanxToken(params)

  return {
    instructions: r.instructions,
    signers: [],
    additionalResult: r.optimisticResult,
    lookupTables: [],
  }
}
