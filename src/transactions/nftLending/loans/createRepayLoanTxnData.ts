import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  repayCnftPerpetualLoanCanopy,
  repayPerpetualLoan,
  repayPerpetualLoanCore,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { TokenStandard } from '@banx/api'
import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BANX_STAKING, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  calculateLoanRepayValueOnCertainDate,
  isBanxSolTokenType,
  isSolTokenType,
} from '@banx/utils'

import { fetchRuleset, parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'
import { BorrowType } from '../types'

export type CreateRepayLoanTxnDataParams = {
  loan: core.Loan
}

type CreateRepayLoanTxnData = (
  params: CreateRepayLoanTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepayLoanTxnDataParams>>

export const createRepayLoanTxnData: CreateRepayLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan } = params

  const borrowType = getLoanBorrowType(loan)

  const {
    instructions: repayInstructions,
    signers: repaySigners,
    accountsCollection,
    lookupTables,
  } = await getIxnsAndSignersByBorrowType(
    {
      loan,
      borrowType,
    },
    walletAndConnection,
  )

  const accounts = [accountsCollection['fraktBond'], accountsCollection['bondTradeTransaction']]

  //? Add BanxSol instructions if offer wasn't closed!
  if (
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isSolTokenType(loan.bondTradeTransaction.lendingToken)
  ) {
    const repayValue = calculateLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })

    return await banxSol.combineWithBuyBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: repayValue,

        instructions: repayInstructions,
        signers: repaySigners,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions: repayInstructions,
    signers: repaySigners,
    lookupTables,
  }
}

const getIxnsAndSignersByBorrowType = async (
  params: CreateRepayLoanTxnDataParams & {
    borrowType: BorrowType
  },
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, borrowType } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond, nft } = loan

  if (borrowType === BorrowType.StakedBanx) {
    if (
      !(
        fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
        fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET
      )
    ) {
      throw new Error(`Not BanxStaked NFT`)
    }

    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await repayStakedBanxPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        userPubkey: wallet.publicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        repayAccounts: [
          {
            bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
            lender: new web3.PublicKey(bondTradeTransaction.user),
            fbond: new web3.PublicKey(fraktBond.publicKey),
            banxStake: new web3.PublicKey(fraktBond.banxStake),
          },
        ],
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  if (borrowType === BorrowType.CNft) {
    if (!nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await helius.getHeliusAssetProof({ assetId: nft.mint, connection })

    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await repayCnftPerpetualLoanCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        userPubkey: wallet.publicKey,
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(bondTradeTransaction.user),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        tree: new web3.PublicKey(nft.compression.tree),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        proof,
        cnftParams: nft.compression,
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  if (borrowType === BorrowType.CoreNft) {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await repayPerpetualLoanCore({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(bondTradeTransaction.user),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        nftAsset: new web3.PublicKey(nft.mint),
      },
      args: {
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const ruleSet = await fetchRuleset({
    nftMint: nft.mint,
    connection,
    marketPubkey: fraktBond.hadoMarket,
  })

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await repayPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      repayAccounts: [
        {
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          ruleSet,
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
        },
      ],
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    accountsCollection,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const getLoanBorrowType = (loan: core.Loan) => {
  const { nft, fraktBond } = loan

  const isStakedBanx =
    fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
    fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET

  if (isStakedBanx) {
    return BorrowType.StakedBanx
  }

  if (nft.compression) {
    return BorrowType.CNft
  }

  if (nft.meta.tokenStandard === TokenStandard.CORE) {
    return BorrowType.CoreNft
  }

  return BorrowType.Default
}

export const parseRepayLoanSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3'] as core.BondTradeTransaction,
    fraktBond: results?.['fraktBond'] as core.FraktBond,
  }
}
