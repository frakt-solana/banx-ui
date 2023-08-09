import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

import { signAndConfirmTransaction } from '@banx/utils'
import {
  MakeCreatePerpetualOfferTransaction,
  MakeRemovePerpetualOfferTransaction,
  makeCreatePerpetualOfferTransaction,
  makeRemovePerpetualOfferTransaction,
} from '@banx/utils/bonds'

type WalletAndConnect = 'connection' | 'wallet'

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  pairPubkey,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  pairPubkey: string
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const executeTransaction = async (
    transaction: web3.Transaction,
    signers: web3.Signer[],
    commitment: web3.Commitment,
  ) => {
    try {
      await signAndConfirmTransaction({
        transaction,
        signers,
        wallet,
        connection,
        commitment,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const buildAndExecuteTransaction = async ({
    makeTransactionFn,
    transactionParams,
    commitment = 'confirmed',
  }: any) => {
    try {
      const { transaction, signers } = await makeTransactionFn({
        ...transactionParams,
        connection,
        wallet,
      })

      await executeTransaction(transaction, signers, commitment)
    } catch (error) {
      console.error(error)
    }
  }

  type CreateOfferTransactionParams = Omit<
    Parameters<MakeCreatePerpetualOfferTransaction>[0],
    WalletAndConnect
  >

  const onCreateOffer = async (): Promise<void> => {
    if (wallet.publicKey) {
      const transactionParams: CreateOfferTransactionParams = {
        marketPubkey,
        bondFeature: BondFeatures.AutoCompoundAndReceiveNft,
        amountOfSolToDeposit: loansAmount * loanValue,
        loanValueFilter: loanValue,
      }

      await buildAndExecuteTransaction({
        makeTransactionFn: makeCreatePerpetualOfferTransaction,
        transactionParams,
      })
    }
  }

  type RemoveOfferTransactionParams = Omit<
    Parameters<MakeRemovePerpetualOfferTransaction>[0],
    WalletAndConnect
  >

  const onRemoveOffer = async (): Promise<void> => {
    if (wallet.publicKey) {
      const transactionParams: RemoveOfferTransactionParams = {
        pairPubkey,
      }

      await buildAndExecuteTransaction({
        makeTransactionFn: makeRemovePerpetualOfferTransaction,
        transactionParams,
      })
    }
  }

  return { onCreateOffer, onRemoveOffer }
}
