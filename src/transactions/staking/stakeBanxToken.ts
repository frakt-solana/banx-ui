import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxTokenActionParams = {
  tokensToStake: BN
}

export type StakeBanxTokenAction = CreateTransactionDataFn<StakeBanxTokenActionParams, null>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (
  ixnParams,
  { wallet, connection },
) => {
  // const priorityFees = await calculatePriorityFees(connection)

  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees: 0,
    accounts: {
      userPubkey: wallet.publicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake: ixnParams.tokensToStake,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await stakeBanxToken(params)

  return {
    instructions: instructions,
    signers: signers,
    lookupTables: [],
  }
}
