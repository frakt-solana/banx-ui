import { web3 } from '@project-serum/anchor'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxPointsMap } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxNftsTokenActionParams = {
  nftMint: string
  whitelistEntry: web3.PublicKey
  hadoRegistry: web3.PublicKey
  banxPointsMap: BanxPointsMap
  priorityFees: number
}

export type StakeBanxNftsTokenAction = MakeActionFn<StakeBanxNftsTokenActionParams, null>

export const stakeBanxNftAction: StakeBanxNftsTokenAction = async (
  ixnParams,
  { connection, wallet },
) => {
  if (!wallet.publicKey?.toBase58()) {
    throw 'Wallet not connected!'
  }

  const params = {
    connection: connection,
    addComputeUnits: true,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    priorityFees: ixnParams.priorityFees,
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
    additionalResult: null,
    lookupTables: [],
  }
}
