import { web3 } from '@project-serum/anchor'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { unstakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxStake } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

type Params = Parameters<typeof unstakeBanxNft>[0]

export type StakeBanxTokenActionParams = {
  userPubkey: web3.PublicKey
  banxStake: web3.PublicKey
  tokenMint: web3.PublicKey
  optimistic: {
    banxSubscribeAdventureOptimistic: BanxSubscribeAdventureOptimistic
    banxStake: BanxStake
  }
}

export type UnStakeBanxNftAction = MakeActionFn<
  StakeBanxTokenActionParams,
  BanxSubscribeAdventureOptimistic
>

export const unStakeBanxNftAction: UnStakeBanxNftAction = async (ixnParams, { connection }) => {
  const params: Params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    args: {
      tokensToUnstake: 9,
    },
    // priorityFees: 12,
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: ixnParams.tokenMint,
      banxStake: ixnParams.banxStake,
    },
    optimistics: {
      banxSubscribeAdventureOptimistic: ixnParams.optimistic.banxSubscribeAdventureOptimistic,
      banxStake: ixnParams.optimistic.banxStake,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const r = await unstakeBanxNft(params)

  return {
    instructions: r.instructions,
    signers: [],
    lookupTables: [],
    optimisticResult: r.optimisticResult,
  }
}
