import { Connection } from '@solana/web3.js'
import { BN, web3 } from 'fbonds-core'

import { BONDS } from '@banx/constants'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'

export const calcPartnerPoints = (v: string | number, tokensPerPartnerPoints?: number) => {
  if (!tokensPerPartnerPoints) {
    return 0
  }
  const banxStakingMintDecimal = new BN(BANX_TOKEN_STAKE_DECIMAL)
  const _v = new BN(v)
  const _tokensPerPartnerPoints = new BN(tokensPerPartnerPoints)
  return Math.round(_v.mul(banxStakingMintDecimal).div(_tokensPerPartnerPoints).toString())
}

export async function getTokenBalance(
  userPubKey: web3.PublicKey,
  connection: Connection,
  tokenMint: web3.PublicKey,
): Promise<number> {
  const tokenAccounts = await connection.getTokenAccountsByOwner(userPubKey, {
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    mint: tokenMint,
  })
  const userTokenAccountAddress = tokenAccounts.value[0]?.pubkey
  if (!userTokenAccountAddress) {
    return 0
  }
  const balance = await connection.getTokenAccountBalance(userTokenAccountAddress)

  return parseFloat(balance?.value.amount) || 0
}
