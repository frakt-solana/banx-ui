import { web3 } from '@project-serum/anchor'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { calculatePriorityFees, sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxNftsTokenActionParams = {
  nftMint: string
  whitelistEntry: web3.PublicKey
  hadoRegistry: web3.PublicKey
}

export type StakeBanxNftsTokenAction = CreateTransactionDataFn<StakeBanxNftsTokenActionParams, null>

export const stakeBanxNftAction: StakeBanxNftsTokenAction = async (
  ixnParams,
  { connection, wallet },
) => {
  if (!wallet.publicKey?.toBase58()) {
    throw 'Wallet not connected!'
  }

  const priorityFees = await calculatePriorityFees(connection)

  const params = {
    connection: connection,
    addComputeUnits: true,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees,
    accounts: {
      tokenMint: new web3.PublicKey(ixnParams.nftMint),
      whitelistEntry: ixnParams.whitelistEntry,
      hadoRegistry: ixnParams.hadoRegistry,
      userPubkey: wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await stakeBanxNft(params)
  return {
    instructions: instructions,
    signers: signers,
    lookupTables: [],
  }
}
