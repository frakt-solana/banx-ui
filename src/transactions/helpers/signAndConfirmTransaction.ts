//eslint-disable-next-line
//@ts-nocheck
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
  transaction.feePayer = wallet.publicKey

  if (signers.length) {
    transaction.sign(...signers)
  }

  const signedTransaction = await wallet.signTransaction(transaction)
  await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'processed',
  })

  onAfterSend?.()

  await new Promise((r) => setTimeout(r, 4000))
}
