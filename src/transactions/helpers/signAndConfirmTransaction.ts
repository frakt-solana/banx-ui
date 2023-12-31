import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

interface SignAndConfirmTransactionProps {
  transaction: web3.Transaction
  signers?: web3.Signer[]
  connection: web3.Connection
  wallet: WalletContextState
  commitment?: web3.Commitment
  onAfterSend?: () => void
  onBeforeApprove?: () => void
}

type SignAndConfirmTransaction = (props: SignAndConfirmTransactionProps) => Promise<string | null>

export const signAndConfirmTransaction: SignAndConfirmTransaction = async ({
  transaction,
  signers = [],
  connection,
  wallet,
  onAfterSend,
  onBeforeApprove,
}) => {
  if (!wallet.publicKey || !wallet.signTransaction) return null

  onBeforeApprove?.()

  const { blockhash } = await connection.getLatestBlockhash()

  transaction.recentBlockhash = blockhash
  transaction.feePayer = wallet.publicKey

  if (signers.length) {
    transaction.sign(...signers)
  }

  const signedTransaction = await wallet.signTransaction(transaction)
  const result = await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'processed',
  })

  onAfterSend?.()

  return result
}
