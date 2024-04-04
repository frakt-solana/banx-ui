import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { PriorityLevel, addComputeUnitsToInstuctions } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxTokenActionParams = {
  tokensToStake: BN
  priorityFeeLevel: PriorityLevel
}

export type StakeBanxTokenAction = CreateTransactionDataFn<StakeBanxTokenActionParams, null>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { instructions: stakeBanxTokenInstructions, signers } = await stakeBanxToken({
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake: ixnParams.tokensToStake,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const instructions = await addComputeUnitsToInstuctions(
    stakeBanxTokenInstructions,
    connection,
    ixnParams.priorityFeeLevel,
  )

  return {
    instructions,
    signers,
    lookupTables: [],
  }
}
