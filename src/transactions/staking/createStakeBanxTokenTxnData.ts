import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { WalletAndConnection } from '../../../../solana-txn-executor/src'
import { CreateTxnData } from '../../../../solana-txn-executor/src/base'

type CreateStakeBanxTokenTxnData = (params: {
  tokensToStake: BN
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<undefined>>

export const createStakeBanxTokenTxnData: CreateStakeBanxTokenTxnData = async ({
  tokensToStake,
  walletAndConnection,
}) => {
  const { instructions, signers } = await stakeBanxToken({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      tokenMint: BANX_TOKEN_MINT,
    },
    args: {
      tokensToStake: tokensToStake,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    lookupTables: [],
  }
}
