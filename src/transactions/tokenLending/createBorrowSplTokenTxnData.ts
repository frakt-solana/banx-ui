import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { borrowPerpetualSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { BorrowToken } from '@banx/pages/tokenLending/BorrowTokenPage/constants'
import { sendTxnPlaceHolder } from '@banx/transactions'

export type BorrowTokenTxnOptimisticResult = { loan: core.TokenLoan; offer: Offer }

export type CreateBorrowTokenTxnDataParams = {
  collateral: BorrowToken
  loanValue: number
  offer: Offer
  optimizeIntoReserves: boolean
  tokenType: LendingTokenType
  aprRate: number
}

export type CreateBorrowTokenTxnData = (
  params: CreateBorrowTokenTxnDataParams & { walletAndConnection: WalletAndConnection },
) => Promise<CreateTxnData<BorrowTokenTxnOptimisticResult>>

export const createBorrowSplTokenTxnData: CreateBorrowTokenTxnData = async ({
  collateral,
  loanValue,
  offer,
  optimizeIntoReserves,
  tokenType,
  walletAndConnection,
  aprRate,
}) => {
  const { instructions, signers, optimisticResults } = await borrowPerpetualSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      bondOffer: new web3.PublicKey(offer.publicKey),
      tokenMint: new web3.PublicKey(collateral.meta.mint),
      hadoMarket: new web3.PublicKey(offer.hadoMarket),
      fraktMarket: new web3.PublicKey(offer.hadoMarket),
    },
    args: {
      amountToget: loanValue,
      optimizeIntoReserves: optimizeIntoReserves,
      aprRate,
      lendingTokenType: tokenType,
    },
    optimistics: {
      bondOffer: offer,
      lendingTokenDecimals: collateral.meta.decimals,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const loanAndOffer = {
    loan: {
      publicKey: optimisticResults.fraktBond.publicKey,
      fraktBond: optimisticResults.fraktBond,
      bondTradeTransaction: optimisticResults.bondTradeTransaction,
      collateral: { ...collateral.meta },
      collateralPrice: collateral.collateralPrice,
    },
    offer: optimisticResults.bondOffer,
  }

  return {
    instructions,
    signers,
    result: loanAndOffer,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
