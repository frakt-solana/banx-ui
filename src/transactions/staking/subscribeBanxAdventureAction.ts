import { web3 } from '@project-serum/anchor'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type SubscribeBanxAdventureParams = {
  userPubkey: web3.PublicKey
  weeks: number[]
  priorityFees: number
}

export type SubscribeBanxAdventureAction = MakeActionFn<SubscribeBanxAdventureParams, null>

export const subscribeBanxAdventureAction: SubscribeBanxAdventureAction = async (
  ixnParams,
  { connection },
) => {
  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    priorityFees: ixnParams.priorityFees,
    args: {
      weeks: ixnParams.weeks,
    },
    accounts: {
      userPubkey: ixnParams.userPubkey,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await subscribeBanxAdventure(params)

  return {
    instructions: instructions,
    signers: signers,
    additionalResult: null,
    lookupTables: [],
  }
}
