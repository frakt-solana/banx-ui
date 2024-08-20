import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { stakeBanxToken } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateStakeBanxTokenTxnDataParams = {
  tokensToStake: BN
}

type CreateStakeBanxTokenTxnData = (
  params: CreateStakeBanxTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateStakeBanxTokenTxnDataParams>>

export const createStakeBanxTokenTxnData: CreateStakeBanxTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { tokensToStake } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await stakeBanxToken({
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
