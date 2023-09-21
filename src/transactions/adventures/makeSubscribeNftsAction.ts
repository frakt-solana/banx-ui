import { web3 } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { staking } from 'fbonds-core/lib/fbond-protocol/functions'

import { Adventure, AdventureNft } from '@banx/api/adventures'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeSubscribeNftsActionParams = {
  nfts: AdventureNft[]
  adventureToSubscribe: Adventure
}

export type MakeSubscribeNftsAction = MakeActionFn<MakeSubscribeNftsActionParams, null>

export const NFTS_TO_SUBSCRIBE_PER_TXN = 5

export const makeSubscribeNftsAction: MakeSubscribeNftsAction = async (
  { nfts, adventureToSubscribe },
  { connection, wallet },
) => {
  if (nfts.length > NFTS_TO_SUBSCRIBE_PER_TXN) {
    throw new Error(`Maximum nfts to subscribe per txn is ${NFTS_TO_SUBSCRIBE_PER_TXN}`)
  }

  const { instructions, signers } = await staking.adventure.subAndUnsubOrHarvestWeeksEnhanced({
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      subAndUnsubParams: nfts.map((nft) => ({
        subscriptionWeeks: staking.helpers.adventureTimestampToWeeks(
          adventureToSubscribe.periodStartedAt,
        ),
        banxStakeSub: new web3.PublicKey(nft?.banxStake?.publicKey || PUBKEY_PLACEHOLDER),
      })),
    },
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    sendTxn: sendTxnPlaceHolder,
    addComputeUnits: true,
  })

  return {
    instructions,
    signers,
    additionalResult: null,
    lookupTables: [],
  }
}
