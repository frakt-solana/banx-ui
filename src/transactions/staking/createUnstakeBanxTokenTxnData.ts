import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { unstakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateUnstakeBanxTokenTxnData = (params: {
  tokensToUnstake: BN
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<undefined>>

export const createUnstakeBanxTokenTxnData: CreateUnstakeBanxTokenTxnData = async ({
  tokensToUnstake,
  walletAndConnection,
}) => {
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
    instructions,
    signers,
    lookupTables: [],
  }
}
