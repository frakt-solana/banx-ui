import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY } from 'fbonds-core/lib/fbond-protocol/constants'
import { getRuleset } from 'fbonds-core/lib/fbond-protocol/helpers'
import { Wallet } from 'solana-transactions-executor'

import { BorrowNft, Loan } from '@banx/api/core'

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

export const createWalletInstance = (wallet: WalletContextState): Wallet => {
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
