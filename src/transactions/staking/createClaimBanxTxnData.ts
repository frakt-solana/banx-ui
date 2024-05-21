import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimStakingRewards } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking/claimStakingRewards'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '../helpers'

type CreateClaimBanxTxnData = (params: {
  weeks: number[]
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<undefined>>

export const createClaimBanxTxnData: CreateClaimBanxTxnData = async ({
  weeks,
  walletAndConnection,
}) => {
  const { instructions, signers } = await claimStakingRewards({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      weeks: weeks,
    },
    accounts: {
      tokenMint: BANX_TOKEN_MINT,
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    lookupTables: [],
  }
}
