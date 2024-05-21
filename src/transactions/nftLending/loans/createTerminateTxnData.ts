import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { terminatePerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateTerminateTxnData = (params: {
  loan: core.Loan
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.Loan>>

export const createTerminateTxnData: CreateTerminateTxnData = async ({
  loan,
  walletAndConnection,
}) => {
  const { bondTradeTransaction, fraktBond } = loan

  const { instructions, signers, optimisticResult } = await terminatePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    optimistic: {
      fraktBond,
      bondOffer: getMockBondOffer(),
      bondTradeTransaction,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const loanOptimisticResult = {
    ...loan,
    ...optimisticResult,
  }

  return {
    instructions,
    signers,
    result: loanOptimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
