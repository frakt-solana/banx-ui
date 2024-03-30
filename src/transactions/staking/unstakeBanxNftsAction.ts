import { web3 } from '@project-serum/anchor'
import { unstakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { MakeActionFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type UnstakeBanxNftsActionParams = {
  userPubkey: web3.PublicKey
  nftMint: string
  priorityFees: number
  banxStakePublicKey: string
}

export type UnstakeBanxNftsActionAction = MakeActionFn<UnstakeBanxNftsActionParams, null>

export const unstakeBanxNftsAction: UnstakeBanxNftsActionAction = async (
  ixnParams,
  { connection },
) => {
  const params = {
    connection: connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    addComputeUnits: true,
    priorityFees: ixnParams.priorityFees,
    accounts: {
      userPubkey: ixnParams.userPubkey,
      tokenMint: new web3.PublicKey(ixnParams.nftMint),
      banxStake: new web3.PublicKey(ixnParams.banxStakePublicKey),
    },
    sendTxn: sendTxnPlaceHolder,
  }

  const { instructions, signers } = await unstakeBanxNft(params)

  return {
    instructions: instructions,
    signers: signers,
    additionalResult: null,
    lookupTables: [],
  }
}
