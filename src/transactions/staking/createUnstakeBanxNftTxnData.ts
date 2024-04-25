import { web3 } from '@project-serum/anchor'
import { unstakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { WalletAndConnection } from '../../../../solana-txn-executor/src'
import { CreateTxnData } from '../../../../solana-txn-executor/src/base'

type CreateUnstakeBanxNftTxnData = (params: {
  nftMint: string
  nftStakePublicKey: string
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<undefined>>

export const createUnstakeBanxNftTxnData: CreateUnstakeBanxNftTxnData = async ({
  nftMint,
  nftStakePublicKey,
  walletAndConnection,
}) => {
  const { instructions, signers } = await unstakeBanxNft({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      tokenMint: new web3.PublicKey(nftMint),
      banxStake: new web3.PublicKey(nftStakePublicKey),
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers: signers,
    lookupTables: [],
  }
}
