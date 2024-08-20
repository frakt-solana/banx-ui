import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { claimStakingRewards } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking/claimStakingRewards'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateClaimBanxTxnDataParams = {
  weeks: BN[]
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

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await claimStakingRewards({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      weeks: weeks.map((week) => week.toNumber()),
    },
    accounts: {
      tokenMint: BANX_TOKEN_MINT,
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts: web3.PublicKey[] = [
    ...accountsCollection['adventures'],
    ...accountsCollection['advenureSubscriptions'],
    accountsCollection['banxStakingSettings'],
    accountsCollection['banxTokenStake'],
  ]

  return {
    accounts,
    params,
    instructions,
    signers,
    lookupTables: [],
  }
}
