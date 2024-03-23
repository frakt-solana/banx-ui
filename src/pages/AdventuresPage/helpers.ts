import { Connection } from '@solana/web3.js'
import { web3 } from 'fbonds-core'
import { calculateRewardsFromSubscriptions } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

import { BanxAdventure, BanxSubscription } from '@banx/api/banxTokenStake'
import { BONDS } from '@banx/constants'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'

export async function getTokenBalance(
  userPubKey: web3.PublicKey,
  connection: Connection,
  tokenMint: web3.PublicKey,
): Promise<string> {
  const tokenAccounts = await connection.getTokenAccountsByOwner(userPubKey, {
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    mint: tokenMint,
  })
  const userTokenAccountAddress = tokenAccounts.value[0]?.pubkey
  if (!userTokenAccountAddress) {
    return '0'
  }
  const balance = await connection.getTokenAccountBalance(userTokenAccountAddress)

  return balance?.value.amount?.toString() || '0'
}

export const calculateRewards = (
  props: { adventure: BanxAdventure; adventureSubscription: BanxSubscription }[],
) => {
  if (!props.length) {
    return 0
  }

  return calculateRewardsFromSubscriptions(props)
}

export const calcPartnerPoints = (v: string | number, tokensPerPartnerPoints?: number) => {
  if (!tokensPerPartnerPoints) {
    return 0
  }
  const res = (parseFloat(v.toString()) * BANX_TOKEN_STAKE_DECIMAL) / tokensPerPartnerPoints
  return isNaN(res) ? '0' : res.toFixed(2)
}
