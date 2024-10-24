import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { revertTerminationPerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateRevertTerminateTokenTxnDataParams = {
  loan: core.TokenLoan
}

type CreateRevertTerminateTokenTxnData = (
  params: CreateRevertTerminateTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRevertTerminateTokenTxnDataParams>>

export const createRevertTerminationTokenTxnData: CreateRevertTerminateTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan } = params

  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, accounts } = await revertTerminationPerpetualLoan({
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    params,
    accounts: [accounts['bondOffer'], accounts['bondTradeTransaction'], accounts['fraktBond']],
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
