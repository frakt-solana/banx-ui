import { web3 } from '@project-serum/anchor'
import { BN } from 'fbonds-core'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateSubscribeTxnDataParams = {
  weeks: BN[]
}

type CreateSubscribeTxnData = (
  params: CreateSubscribeTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateSubscribeTxnDataParams>>

export const createSubscribeTxnData: CreateSubscribeTxnData = async (
  params,
  walletAndConnection,
) => {
  const { weeks } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await subscribeBanxAdventure({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      weeks: weeks.map((week) => week.toNumber()),
    },
    accounts: {
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
