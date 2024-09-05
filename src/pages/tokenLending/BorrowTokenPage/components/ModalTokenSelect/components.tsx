import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

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
        <span className={styles.tokensListItemAddress}>
          {shortenAddress(token.collateral.mint)}
        </span>
      </div>
    </div>
    <TokenBalanceInfo token={token} />
  </div>
)

interface TokenBalanceInfoProps {
  token: BaseToken
}

const TokenBalanceInfo: FC<TokenBalanceInfoProps> = ({ token }) => {
  const USDC_BALANCE_TRESHOLD = 0.001

  const { amountInWallet, collateral } = token

  if (!amountInWallet) return null

  const tokensAmount = amountInWallet / Math.pow(10, collateral.decimals)
  const tokensAmountInUsd = tokensAmount * collateral.priceUsd

  return (
    <div className={styles.tokensListItemBalanceInfo}>
      <span className={styles.tokensListItemCollateralsAmount}>
        {formatCollateralTokenValue(tokensAmount)}
      </span>

      {!!tokensAmountInUsd && tokensAmountInUsd > USDC_BALANCE_TRESHOLD && (
        <span className={styles.tokensListItemCollateralsAmountUsd}>
          {formatCollateralTokenValue(tokensAmountInUsd)}$
        </span>
      )}
    </div>
  )
}

export const TokensListLabels = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.tokensListLabels}>
      <span className={styles.tokenListLabel}>Token</span>
      {connected && <span className={styles.tokenListLabel}>Available</span>}
    </div>
  )
}

interface PinnedTokensListProps {
  onChange: (token: BaseToken) => void
  tokensList: BaseToken[]
}

export const PinnedTokensList: FC<PinnedTokensListProps> = ({ onChange, tokensList }) => {
  return (
    <div className={styles.pinnedTokensList}>
      {tokensList.map((token) => (
        <div
          key={token.collateral.mint}
          onClick={() => onChange(token)}
          className={styles.pinnedToken}
        >
          <img src={token.collateral.logoUrl} className={styles.pinnedTokenIcon} />
          <span className={styles.pinnedTokenLabel}>{token.collateral.ticker}</span>
        </div>
      ))}
    </div>
  )
}
