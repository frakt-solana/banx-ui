import { WalletContextState } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { web3 } from 'fbonds-core'

type GenerateSignature = (props: {
  isLedger?: boolean
  nonce: string
  wallet: WalletContextState
  connection: web3.Connection
}) => Promise<string | null>
export const generateSignature: GenerateSignature = async ({
  isLedger = false,
  nonce,
  wallet,
  connection,
}) => {
  if (!wallet.publicKey) throw new Error('Wallet not connected')

  try {
    if (isLedger) {
      const txn = createAuthTxn(nonce)
      txn.feePayer = wallet.publicKey
      txn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      if (!wallet.signTransaction) throw new Error('Wallet doesnt contain signTransaction method')
      const signedTxn = await wallet.signTransaction(txn)
      const isSignatureValid = validateAuthTxn(signedTxn, nonce)

      if (!isSignatureValid) return null

      return bs58.encode(signedTxn.serialize()) as string
    }

    const encodedMessage = new TextEncoder().encode(nonce)
    if (!wallet.signMessage) throw new Error('Wallet doesnt contain signMessage method')
    const signature = await wallet.signMessage(encodedMessage)
    return bs58.encode(signature)
  } catch (error) {
    console.error(error)
    return null
  }
}

const MEMO_PROGRAM_ID = new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

export const createAuthTxn = (nonce: string) =>
  new web3.Transaction().add(
    new web3.TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(nonce, 'utf8'),
    }),
  )

export const validateAuthTxn = (txn: web3.Transaction, nonce: string) => {
  try {
    const ixn = txn.instructions.at(-1)
    if (!ixn) return false
    if (!ixn.programId.equals(MEMO_PROGRAM_ID)) return false
    if (ixn.data.toString() !== nonce) return false
    if (!txn.verifySignatures()) return false
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

type BanxLoginJwtData = {
  exp: number //? unix timestamp
  iat: number //? unix timestamp
  wallet: string
}
export const parseBanxLoginJwt = (token: string) => {
  const base64Payload = token.split('.')[1]
  const payload = Buffer.from(base64Payload, 'base64')
  const data: BanxLoginJwtData = JSON.parse(payload.toString())
  return data || null
}
