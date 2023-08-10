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

type SignAndConfirmTransaction = (props: SignAndConfirmTransactionProps) => Promise<void>

export const signAndConfirmTransaction: SignAndConfirmTransaction = async ({
  transaction,
  signers = [],
  connection,
  wallet,
  onAfterSend,
  onBeforeApprove,
}) => {
  onBeforeApprove?.()

  const { blockhash } = await connection.getLatestBlockhash()

  transaction.recentBlockhash = blockhash

  if (wallet.publicKey) {
    transaction.feePayer = wallet.publicKey
  }

  if (signers.length) {
    transaction.sign(...signers)
  }

  if (wallet.signTransaction) {
    const signedTransaction = await wallet.signTransaction(transaction)
    await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'processed',
    })
  }

  onAfterSend?.()

  await Promise.resolve()
}
