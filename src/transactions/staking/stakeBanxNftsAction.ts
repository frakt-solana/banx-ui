import { web3 } from '@project-serum/anchor'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { createInstructionsWithPriorityFees } from '../helpers'

export type StakeBanxNftsTokenActionParams = {
  nftMint: string
  whitelistEntry: web3.PublicKey
  hadoRegistry: web3.PublicKey
}

export type StakeBanxNftsTokenAction = CreateTransactionDataFn<StakeBanxNftsTokenActionParams, null>

export const stakeBanxNftAction: StakeBanxNftsTokenAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { instructions, signers } = await stakeBanxNft({
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      tokenMint: new web3.PublicKey(ixnParams.nftMint),
      whitelistEntry: ixnParams.whitelistEntry,
      hadoRegistry: ixnParams.hadoRegistry,
      userPubkey: wallet.publicKey,
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
