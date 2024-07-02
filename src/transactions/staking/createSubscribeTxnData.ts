import { web3 } from '@project-serum/anchor'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'

import { CreateTxnData, WalletAndConnection } from '@banx/../../solana-txn-executor/src'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateSubscribeTxnDataParams = {
  weeks: number[]
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

  const { instructions, signers } = await subscribeBanxAdventure({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      weeks: weeks,
    },
    accounts: {
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
