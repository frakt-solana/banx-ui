import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxTokenActionParams = {
  tokensToStake: BN
  priorityFees: number
}

export type StakeBanxTokenAction = MakeActionFn<StakeBanxTokenActionParams, null>

export const stakeBanxTokenAction: StakeBanxTokenAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { tokensToStake, priorityFees } = ixnParams

  const { instructions, signers } = await stakeBanxToken({
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake,
    },
    priorityFees,
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, signers, lookupTables: [] }
}
