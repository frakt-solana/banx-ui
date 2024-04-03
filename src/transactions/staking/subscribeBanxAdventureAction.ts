import { web3 } from '@project-serum/anchor'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { createPriorityFeesInstruction } from '../helpers'

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
  const { instructions, signers } = await subscribeBanxAdventure({
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    args: {
      weeks: ixnParams.weeks,
    },
    accounts: {
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const priorityFeeInstruction = await createPriorityFeesInstruction(instructions, connection)

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers: signers,
    lookupTables: [],
  }
}
