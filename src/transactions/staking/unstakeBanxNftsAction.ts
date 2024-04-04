import { web3 } from '@project-serum/anchor'
import { unstakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { createInstructionsWithPriorityFees } from '../helpers'

export type UnstakeBanxNftsActionParams = {
  userPubkey: web3.PublicKey
  nftMint: string
  nftStakePublicKey: string
}

export type UnstakeBanxNftsActionAction = CreateTransactionDataFn<UnstakeBanxNftsActionParams, null>

export const unstakeBanxNftsAction: UnstakeBanxNftsActionAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { instructions, signers } = await unstakeBanxNft({
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      tokenMint: new web3.PublicKey(ixnParams.nftMint),
      banxStake: new web3.PublicKey(ixnParams.nftStakePublicKey),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const instructionsWithPriorityFees = await createInstructionsWithPriorityFees(
    instructions,
    connection,
  )

  return {
    instructions: instructionsWithPriorityFees,
    signers: signers,
    lookupTables: [],
  }
}
