import { Connection } from '@solana/web3.js'
import { web3 } from 'fbonds-core'
import { calculateRewardsFromSubscriptions } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

import { BanxAdventure, BanxSubscription } from '@banx/api/staking'
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
): bigint => {
  if (!props.length) {
    return BigInt(0)
  }

  return calculateRewardsFromSubscriptions(props) as bigint
}

export const calcPartnerPoints = (v: string, tokensPerPartnerPoints?: string) => {
  if (!tokensPerPartnerPoints) {
    return '0'
  }
  const res = (parseFloat(v) * BANX_TOKEN_STAKE_DECIMAL) / parseFloat(tokensPerPartnerPoints)
  return isNaN(res) ? '0' : res.toFixed(2)
}
