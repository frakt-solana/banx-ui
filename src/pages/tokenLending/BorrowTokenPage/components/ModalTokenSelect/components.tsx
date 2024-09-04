import { FC } from 'react'

import { SOLANAFM_URL } from '@banx/constants'
import { formatCollateralTokenValue, shortenAddress } from '@banx/utils'

import { BaseToken } from './ModalTokenSelect'

import styles from './ModalTokenSelect.module.less'

interface TokenListItemProps {
  token: BaseToken
  onClick: () => void
}

export const TokenListItem: FC<TokenListItemProps> = ({ token, onClick }) => (
  <div onClick={onClick} className={styles.tokensListItem}>
    <div className={styles.tokensListItemInfo}>
      <img src={token.collateral.logoUrl} className={styles.tokensListItemIcon} />
      <div className={styles.flexCol}>
        <span className={styles.tokensListItemTicker}>{token.collateral.ticker}</span>
        <TokenLink mint={token.collateral.mint} />
      </div>
    </div>
    <TokenBalanceInfo token={token} />
  </div>
)

interface TokenBalanceInfoProps {
  token: BaseToken
}

const TokenBalanceInfo: FC<TokenBalanceInfoProps> = ({ token }) => {
  const { amountInWallet, collateral } = token

  if (!amountInWallet) return null

  const tokensAmount = amountInWallet / Math.pow(10, collateral.decimals)
  const tokensAmountInUsd = tokensAmount * collateral.priceUsd

  return (
    <div className={styles.tokensListItemBalanceInfo}>
      <span>{formatCollateralTokenValue(tokensAmount)}</span>
      <span>{formatCollateralTokenValue(tokensAmountInUsd)}$</span>
    </div>
  )
}

const TokenLink: FC<{ mint: string }> = ({ mint }) => {
  const path = `${SOLANAFM_URL}address/${mint}`

  return (
    <a className={styles.tokensListItemLink} target="_blank" rel="noopener noreferrer" href={path}>
      {shortenAddress(mint)}
    </a>
  )
}
