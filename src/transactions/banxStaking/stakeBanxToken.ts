import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

type Params = Parameters<typeof stakeBanxToken>[0]

export type StakeBanxTokenActionParams = {
  userPubkey: web3.PublicKey
  tokensToStake: number
  optimistic: BanxSubscribeAdventureOptimistic
}

export type StakeBanxTokenAction = MakeActionFn<
  StakeBanxTokenActionParams,
  BanxSubscribeAdventureOptimistic
>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (
  ixnParams,
  { connection, wallet },
) => {
  console.log(BANX_TOKEN_MINT.toBase58())
  const params: Params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake: ixnParams.tokensToStake,
    },
    optimistics: ixnParams.optimistic,
    sendTxn: async (transaction: web3.Transaction, signers: web3.Signer[]) => {},
  }

  const r = await stakeBanxToken(params)
  console.log('params ', params)
  console.log('result ', r)
  return {
    instructions: r.instructions,
    signers: [],
    additionalResult: r.optimisticResult,
    lookupTables: [],
  }
}
