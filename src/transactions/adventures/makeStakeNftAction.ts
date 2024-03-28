import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { staking } from 'fbonds-core/lib/fbond-protocol/functions/'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Adventure } from '@banx/api/adventures'
import { BANX_STAKING, BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeStakeNftActionParams = {
  nftMint: string
  adventures: Adventure[]
  priorityFees: number
}

export type MakeStakeNftAction = CreateTransactionDataFn<MakeStakeNftActionParams, null>

export const makeStakeNftAction: MakeStakeNftAction = async (ixnParams, { connection, wallet }) => {
  const { nftMint, adventures, priorityFees } = ixnParams

  const { instructions, signers } = await staking.manageStake.stakeBanx({
    accounts: {
      whitelistEntry: new web3.PublicKey(BANX_STAKING.WHITELIST_ENTRY_PUBKEY),
      hadoRegistry: new web3.PublicKey(BANX_STAKING.HADO_REGISTRY_PUBKEY),
      userPubkey: wallet.publicKey as web3.PublicKey,
      tokenMint: new web3.PublicKey(nftMint),
    },
    addComputeUnits: true,
    args: {
      weeksOfSubscriptions: adventures.map(({ periodStartedAt }) =>
        staking.helpers.adventureTimestampToWeeks(periodStartedAt),
      ),
    },
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    sendTxn: sendTxnPlaceHolder,
    priorityFees,
  })

  return {
    instructions,
    signers,
    additionalResult: null,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
