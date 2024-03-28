import { web3 } from '@project-serum/anchor'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxPointsMap } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type StakeBanxNftsTokenActionParams = {
  tokenMint: web3.PublicKey
  whitelistEntry: web3.PublicKey
  hadoRegistry: web3.PublicKey
  banxPointsMap: BanxPointsMap
  priorityFees: number
  optimistic: BanxSubscribeAdventureOptimistic
}

export type StakeBanxNftsTokenAction = CreateTransactionDataFn<
  StakeBanxNftsTokenActionParams,
  BanxSubscribeAdventureOptimistic
>

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
      tokenMint: ixnParams.tokenMint,
      whitelistEntry: ixnParams.whitelistEntry,
      hadoRegistry: ixnParams.hadoRegistry,
      userPubkey: wallet.publicKey,
    },
    optimistics: {
      banxSubscribeAdventureOptimistic: ixnParams.optimistic,
      banxPointsMap: ixnParams.banxPointsMap,
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
