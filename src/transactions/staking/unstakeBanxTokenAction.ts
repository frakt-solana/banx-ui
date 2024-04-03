import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { unstakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { createPriorityFeesInstruction } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type UnstakeBanxTokenParams = {
  tokensToUnstake: BN
}

export type UnstakeBanxTokenParamsAction = CreateTransactionDataFn<UnstakeBanxTokenParams, null>

export const unstakeBanxTokenAction: UnstakeBanxTokenParamsAction = async (
  { tokensToUnstake },
  { wallet, connection },
) => {
  const { instructions, signers } = await unstakeBanxToken({
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToUnstake,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const priorityFeeInstruction = await createPriorityFeesInstruction(instructions, connection)

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers,
    lookupTables: [],
  }
}
