import { web3 } from '@project-serum/anchor'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimStakingRewards } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking/claimStakingRewards'

import { CreateTxnData, WalletAndConnection } from '@banx/../../solana-txn-executor/src'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateClaimBanxTxnDataParams = {
  weeks: number[]
}
type CreateClaimBanxTxnData = (
  params: CreateClaimBanxTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateClaimBanxTxnDataParams>>

export const createClaimBanxTxnData: CreateClaimBanxTxnData = async (
  params,
  walletAndConnection,
) => {
  const { weeks } = params

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
    params,
    instructions,
    signers,
    lookupTables: [],
  }
}
