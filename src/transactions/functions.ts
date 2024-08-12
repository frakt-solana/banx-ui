import { WalletContextState } from '@solana/wallet-adapter-react'
import { BN, web3 } from 'fbonds-core'
import { getRuleset } from 'fbonds-core/lib/fbond-protocol/helpers'
import { chain } from 'lodash'
import {
  GetPriorityFee,
  SimulatedAccountInfoByPubkey,
  Wallet,
  WalletAndConnection,
  extractAccountKeysFromInstructions,
} from 'solana-transactions-executor'
import {
  convertValuesInAccount,
  decodeAccountDataSafe,
  getAccountName,
  parseEnumsInAccount,
} from 'solana-transactions-parser'

import { helius } from '@banx/api/common'
import { getPriorityFeeLevel } from '@banx/store/common'
import { ZERO_BN } from '@banx/utils'

import { BANX_ACCOUNTS_NAMES_AND_DISCRIMINATORS, banxCoder } from './constants'

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

export const customBNConverter = {
  bnParser: (v: BN) => {
    try {
      return v
    } catch (err) {
      return ZERO_BN
    }
  },
  pubkeyParser: (v: web3.PublicKey) => v,
}

export const parseBanxAccountInfo = <T>(
  publicKey: web3.PublicKey,
  info: web3.SimulatedTransactionAccountInfo | null,
  customConverter?: Parameters<typeof convertValuesInAccount>[1],
): [string, T] | null => {
  if (!info || !info.data) return null

  const bufferData = Buffer.from(info.data[0], 'base64')

  const accountName = getAccountName(BANX_ACCOUNTS_NAMES_AND_DISCRIMINATORS, bufferData) ?? ''

  const parsedData = decodeAccountDataSafe<unknown>(banxCoder, accountName, bufferData)

  const parsedDataWithEnums = parsedData
    ? { publicKey, ...parseEnumsInAccount<object>(parsedData) }
    : null

  const convertedAccount = convertValuesInAccount<T>(
    parsedDataWithEnums,
    customConverter ?? {
      bnParser: (v) => {
        try {
          return v.toNumber()
        } catch (err) {
          return 0
        }
      },
      pubkeyParser: (v) => v.toBase58(),
    },
  )

  return [accountName, convertedAccount]
}

/**
 * @param accountInfoByPubkey - default solana-transactions-executor result for simulations
 * @returns Dictionary<accountName, parsedAccount[]> accountName same as in IDL
 */
export const parseAccountInfoByPubkey = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
  customConverter?: Parameters<typeof convertValuesInAccount>[1],
): Record<string, unknown[]> => {
  return chain(accountInfoByPubkey)
    .toPairs()
    .filter(([, info]) => !!info)
    .map(([publicKey, info]) => {
      return parseBanxAccountInfo(new web3.PublicKey(publicKey), info, customConverter)
    })
    .compact()
    .groupBy(([name]) => name)
    .entries()
    .map(([name, nameAndAccountPairs]) => {
      return [name, nameAndAccountPairs.map(([, account]) => account)]
    })
    .fromPairs()
    .value()
}
