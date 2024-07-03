import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { unstakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateUnstakeBanxTokenTxnDataParams = {
  tokensToUnstake: BN
}

type CreateUnstakeBanxTokenTxnData = (
  params: CreateUnstakeBanxTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateUnstakeBanxTokenTxnDataParams>>

export const createUnstakeBanxTokenTxnData: CreateUnstakeBanxTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { tokensToUnstake } = params

  const { instructions, signers } = await unstakeBanxToken({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToUnstake,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    params,
    instructions,
    signers,
    lookupTables: [],
  }
}
