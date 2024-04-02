import { web3 } from '@project-serum/anchor'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { calculatePriorityFees, sendTxnPlaceHolder } from '@banx/utils'

export type SubscribeBanxAdventureParams = {
  weeks: number[]
}

export type SubscribeBanxAdventureAction = CreateTransactionDataFn<
  SubscribeBanxAdventureParams,
  null
>

export const subscribeBanxAdventureAction: SubscribeBanxAdventureAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const priorityFees = await calculatePriorityFees(connection)

  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    priorityFees,
    args: {
      weeks: ixnParams.weeks,
    },
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await subscribeBanxAdventure(params)

  return {
    instructions: instructions,
    signers: signers,
    lookupTables: [],
  }
}
