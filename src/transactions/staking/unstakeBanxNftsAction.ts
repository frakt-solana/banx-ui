import { web3 } from '@project-serum/anchor'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { unstakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxStake } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type UnstakeBanxNftsActionParams = {
  userPubkey: web3.PublicKey
  tokenMint: web3.PublicKey
  priorityFees: number
  optimistic: {
    banxSubscribeAdventureOptimistic: BanxSubscribeAdventureOptimistic
    banxStake: BanxStake
  }
}

export type UnstakeBanxNftsActionAction = MakeActionFn<
  UnstakeBanxNftsActionParams,
  BanxSubscribeAdventureOptimistic
>

export const unstakeBanxNftsAction: UnstakeBanxNftsActionAction = async (
  ixnParams,
  { connection },
) => {
  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    priorityFees: ixnParams.priorityFees,
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: ixnParams.tokenMint,
      banxStake: new web3.PublicKey(ixnParams.optimistic.banxStake.publicKey),
    },
    optimistics: {
      banxSubscribeAdventureOptimistic: ixnParams.optimistic.banxSubscribeAdventureOptimistic,
      banxStake: ixnParams.optimistic.banxStake,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await unstakeBanxNft(params)

  return {
    instructions: instructions,
    signers: signers,
    lookupTables: [],
  }
}
