import { web3 } from '@project-serum/anchor'
import { unstakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateUnstakeBanxNftTxnDataParams = {
  nftMint: string
  nftStakePublicKey: string
}

type CreateUnstakeBanxNftTxnData = (
  params: CreateUnstakeBanxNftTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateUnstakeBanxNftTxnDataParams>>

export const createUnstakeBanxNftTxnData: CreateUnstakeBanxNftTxnData = async (
  params,
  walletAndConnection,
) => {
  const { nftMint, nftStakePublicKey } = params

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
    params,
    instructions,
    signers: signers,
    lookupTables: [],
  }
}
