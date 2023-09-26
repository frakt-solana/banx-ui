import { web3 } from 'fbonds-core'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { staking } from 'fbonds-core/lib/fbond-protocol/functions/'

import { AdventureNft } from '@banx/api/adventures'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'
import { isSubscriptionActive } from './helpers'

export type MakeUnstakeNftAction = MakeActionFn<AdventureNft, null>

export const makeUnstakeNftAction: MakeUnstakeNftAction = async (nft, { connection, wallet }) => {
  const { instructions, signers } = await staking.manageStake.unstakeBanx({
    accounts: {
      banxStake: new web3.PublicKey(nft?.banxStake?.publicKey || PUBKEY_PLACEHOLDER),
      userPubkey: wallet.publicKey as web3.PublicKey,
      tokenMint: new web3.PublicKey(nft.mint),
      subscriptionsAndAdventures:
        nft?.subscriptions?.filter(isSubscriptionActive).map(({ publicKey, adventure }) => ({
          adventure: new web3.PublicKey(adventure),
          adventureSubscription: new web3.PublicKey(publicKey),
        })) ?? [],
    },
    addComputeUnits: true,
    connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: null,
    lookupTables: [],
  }
}
