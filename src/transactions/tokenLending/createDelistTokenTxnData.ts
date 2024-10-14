import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { removePerpetualListingSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { TokenLoan } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateDelistTokenTxnDataParams = {
  loan: TokenLoan
}

type CreateDelistTokenTxnData = (
  params: CreateDelistTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateDelistTokenTxnDataParams>>

export const createDelistTokenTxnData: CreateDelistTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { connection, wallet } = walletAndConnection

  const { loan } = params

  // console.log({
  //   programId: BONDS.PROGRAM_PUBKEY,
  //   accounts: {
  //     userPubkey: wallet.publicKey.toBase58(),
  //     collateralMint: loan.collateral.mint,
  //     fraktBond: loan.fraktBond.publicKey,
  //     bondOffer: loan.bondTradeTransaction.bondOffer,
  //     oldBondTradeTransaction: loan.bondTradeTransaction.publicKey,
  //   },
  //   connection,
  //   sendTxn: sendTxnPlaceHolder,
  // })

  const { instructions, signers } = await removePerpetualListingSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      collateralMint: new web3.PublicKey(loan.collateral.mint),
      fraktBond: new web3.PublicKey(loan.fraktBond.publicKey),
      bondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
      oldBondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    params,
    accounts: [],
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
