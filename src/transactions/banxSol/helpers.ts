import { Instruction } from '@jup-ag/api'
import { web3 } from 'fbonds-core'

export const deserializeInstruction = (instruction: Instruction) => {
  return new web3.TransactionInstruction({
    programId: new web3.PublicKey(instruction.programId),
    keys: instruction.accounts.map((key) => ({
      pubkey: new web3.PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, 'base64'),
  })
}
