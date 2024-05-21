import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { getRuleset } from 'fbonds-core/lib/fbond-protocol/helpers'
import {
  GetPriorityFee,
  Wallet,
  WalletAndConnection,
  extractAccountKeysFromInstructions,
} from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { getPriorityFeeLevel } from '@banx/store/common'

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

export const executorGetPriorityFee: GetPriorityFee = ({ txnParams, connection }) => {
  const priorityLevel = getPriorityFeeLevel()

  const { instructions } = txnParams
  const accountKeys = extractAccountKeysFromInstructions(instructions).map((key) => key.toBase58())

  return helius.getHeliusPriorityFeeEstimate({ accountKeys, connection, priorityLevel })
}
