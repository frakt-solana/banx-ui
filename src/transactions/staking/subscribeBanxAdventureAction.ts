import { web3 } from '@project-serum/anchor'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type SubscribeBanxAdventureParams = {
  weeks: number[]
  priorityFeeLevel: PriorityLevel
}

export type SubscribeBanxAdventureAction = CreateTransactionDataFn<
  SubscribeBanxAdventureParams,
  null
>

export const subscribeBanxAdventureAction: SubscribeBanxAdventureAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { instructions: subscribeInxtructions, signers } = await subscribeBanxAdventure({
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      weeks: ixnParams.weeks,
    },
    accounts: {
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const instructions = await mergeWithComputeUnits({
    instructions: subscribeInxtructions,
    connection: connection,
    lookupTables: [],
    payer: wallet.publicKey,
    priorityLevel: ixnParams.priorityFeeLevel,
  })

  return {
    instructions,
    signers: signers,
    lookupTables: [],
  }
}
