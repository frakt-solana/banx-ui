import { web3 } from '@project-serum/anchor'
import { subscribeBanxAdventure } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { WalletAndConnection } from '../../../../solana-txn-executor/src'
import { CreateTxnData } from '../../../../solana-txn-executor/src/base'

type CreateSubscribeTxnData = (params: {
  weeks: number[]
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<undefined>>

export const createSubscribeTxnData: CreateSubscribeTxnData = async ({
  weeks,
  walletAndConnection,
}) => {
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
    instructions,
    signers,
    lookupTables: [],
  }
}
