import { web3 } from '@project-serum/anchor'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxPointsMap } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

type Params = Parameters<typeof stakeBanxNft>[0]

export type StakeBanxTokenActionParams = {
  tokenMint: web3.PublicKey
  whitelistEntry: web3.PublicKey
  hadoRegistry: web3.PublicKey
  banxPointsMap: BanxPointsMap
  optimistic: BanxSubscribeAdventureOptimistic
}

export type StakeBanxTokenAction = MakeActionFn<
  StakeBanxTokenActionParams,
  BanxSubscribeAdventureOptimistic
>

export const stakeBanxNftAction: StakeBanxTokenAction = async (
  ixnParams,
  { connection, wallet },
) => {
  if (!wallet.publicKey?.toBase58()) {
    throw 'Wallet not connected!'
  }

  const params: Params = {
    connection: connection,
    addComputeUnits: true,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
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

  const r = await stakeBanxNft(params)
  console.log('params ', params)
  console.log('result ', r)
  return {
    instructions: r.instructions,
    signers: r.signers,
    additionalResult: r.optimisticResult,
    lookupTables: [],
  }
}
