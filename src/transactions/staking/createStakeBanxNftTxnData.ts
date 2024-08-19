import { web3 } from '@project-serum/anchor'
import { stakeBanxNft } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BANX_STAKING, BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

type CreateStakeBanxNftTxnDataParams = {
  nftMint: string
}
type CreateStakeBanxNftTxnData = (
  params: CreateStakeBanxNftTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateStakeBanxNftTxnDataParams>>

export const createStakeBanxNftTxnData: CreateStakeBanxNftTxnData = async (
  params,
  walletAndConnection,
) => {
  const { nftMint } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await stakeBanxNft({
    connection: walletAndConnection.connection,
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      tokenMint: new web3.PublicKey(nftMint),
      whitelistEntry: new web3.PublicKey(BANX_STAKING.WHITELIST_ENTRY_PUBKEY),
      hadoRegistry: new web3.PublicKey(BANX_STAKING.HADO_REGISTRY_PUBKEY),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts: web3.PublicKey[] = [
    ...accountsCollection['adventures'],
    ...accountsCollection['advenureSubscriptions'],
    accountsCollection['banxStake'],
    accountsCollection['banxStakingSettings'],
    accountsCollection['banxTokenStake'],
  ]

  return {
    accounts,
    params,
    instructions,
    signers: signers,
    lookupTables: [],
  }
}
