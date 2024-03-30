import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { unstakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type UnstakeBanxTokenParams = {
  tokensToUnstake: BN
  priorityFees: number
}

export type UnstakeBanxTokenParamsAction = MakeActionFn<UnstakeBanxTokenParams, null>

export const unstakeBanxTokenAction: UnstakeBanxTokenParamsAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { tokensToUnstake, priorityFees } = ixnParams

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
    priorityFees,
    sendTxn: sendTxnPlaceHolder,
  })

  return { instructions, signers, lookupTables: [] }
}
