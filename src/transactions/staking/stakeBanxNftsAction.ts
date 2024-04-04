import { web3 } from '@project-serum/anchor'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxNftsTokenActionParams = {
  nftMint: string
  whitelistEntry: web3.PublicKey
  hadoRegistry: web3.PublicKey
  priorityFeeLevel: PriorityLevel
}

export type StakeBanxNftsTokenAction = CreateTransactionDataFn<StakeBanxNftsTokenActionParams, null>

export const stakeBanxNftAction: StakeBanxNftsTokenAction = async (
  ixnParams,
  { wallet, connection },
) => {
  const { instructions: stakeBanxNftInstructions, signers } = await stakeBanxNft({
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

  const instructions = await mergeWithComputeUnits({
    instructions: stakeBanxNftInstructions,
    connection: connection,
    lookupTables: [],
    payer: wallet.publicKey,
    priorityLevel: ixnParams.priorityFeeLevel,
  })

  return {
    instructions,
    signers: signers,
    lookupTables: [],
  }
}
