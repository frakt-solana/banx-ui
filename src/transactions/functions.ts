import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY } from 'fbonds-core/lib/fbond-protocol/constants'
import { getRuleset } from 'fbonds-core/lib/fbond-protocol/helpers'
import { Wallet } from 'solana-transactions-executor'

import { BorrowNft, Loan } from '@banx/api/core'
import { getHeliusPriorityFeeEstimate } from '@banx/api/helius'
import { getPriorityFeeLevel } from '@banx/store'

import { GetPriorityFee, WalletAndConnection } from '../../../solana-txn-executor/src'
import { extractAccountKeysFromInstructions } from '../../../solana-txn-executor/src/base'

export const convertLoanToBorrowNft = (loan: Loan): BorrowNft => {
  const { nft, fraktBond, bondTradeTransaction } = loan

  const borrowNft = {
    mint: nft.mint,
    loan: {
      marketPubkey: fraktBond.hadoMarket || EMPTY_PUBKEY.toBase58(),
      fraktMarket: fraktBond.fraktMarket,
      marketApr: bondTradeTransaction.amountOfBonds,
      banxStake: fraktBond.banxStake || EMPTY_PUBKEY.toBase58(),
    },
    nft,
  }

  return borrowNft
}

type CreateExecutorWalletAndConnection = (params: {
  wallet: WalletContextState
  connection: web3.Connection
}) => WalletAndConnection
export const createExecutorWalletAndConnection: CreateExecutorWalletAndConnection = ({
  wallet,
  connection,
}) => {
  return { wallet: createExecutorWallet(wallet), connection }
}

const createExecutorWallet = (wallet: WalletContextState): Wallet => {
  const { publicKey, signTransaction, signAllTransactions } = wallet

  if (!publicKey) {
    throw new Error('Public key is not available')
  }

  if (!signTransaction) {
    throw new Error('Sign transaction method is not available')
  }

  return {
    publicKey,
    signTransaction,
    signAllTransactions,
  }
}

type FetchRuleset = (props: {
  nftMint: string
  marketPubkey?: string
  connection: web3.Connection
}) => Promise<web3.PublicKey | undefined>
//? Some collections have different rulests for NFTs. Need to ignore caching for them. E.g. "Flash Trade" collection
const IGNORE_CACHING_MARKETS = ['JE5PENhUEUzkHUoZDe6ydwXr6LEBfddHL7yiugDBKr8f']
const rulesetsCache = new Map<string, Promise<web3.PublicKey | undefined>>()
export const fetchRuleset: FetchRuleset = ({ nftMint, marketPubkey, connection }) => {
  //? Prevent error when marketPubkey is undefined
  if (!marketPubkey) return new Promise(() => undefined)

  //? Ignore caching for some collections
  if (IGNORE_CACHING_MARKETS.includes(marketPubkey)) {
    return getRuleset(nftMint, connection)
  }

  if (!rulesetsCache.has(marketPubkey)) {
    const rulesetPromise = getRuleset(nftMint, connection)

    rulesetsCache.set(marketPubkey, rulesetPromise)
  }

  return rulesetsCache.get(marketPubkey)!
}

const lookupTablesCache = new Map<
  string,
  Promise<web3.RpcResponseAndContext<web3.AddressLookupTableAccount | null>>
>()
export const fetchLookupTableAccount = (
  lookupTable: web3.PublicKey,
  connection: web3.Connection,
): Promise<web3.RpcResponseAndContext<web3.AddressLookupTableAccount | null>> => {
  const lookupTableAddressStr = lookupTable.toBase58()

  if (!lookupTablesCache.has(lookupTableAddressStr)) {
    const lookupTableAccountPromise = connection.getAddressLookupTable(lookupTable)

    lookupTablesCache.set(lookupTableAddressStr, lookupTableAccountPromise)
  }

  return lookupTablesCache.get(lookupTableAddressStr)!
}

export const executorGetPriorityFee: GetPriorityFee = ({ txnParams, connection }) => {
  const priorityLevel = getPriorityFeeLevel()

  const { instructions } = txnParams
  const accountKeys = extractAccountKeysFromInstructions(instructions).map((key) => key.toBase58())

  return getHeliusPriorityFeeEstimate({ accountKeys, connection, priorityLevel })
}
