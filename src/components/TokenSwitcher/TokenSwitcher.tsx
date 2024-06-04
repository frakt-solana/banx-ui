import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useTokenType } from '@banx/store/nft'
import { isBanxSolTokenType, isSolTokenType } from '@banx/utils'

import styles from './TokenSwitcher.module.less'

const TOKENS = [LendingTokenType.BanxSol, LendingTokenType.NativeSol, LendingTokenType.Usdc]

type TokenValueProps = {
  active?: boolean
  tokenType: LendingTokenType
  onClick: () => void
}
const TokenValue: FC<TokenValueProps> = ({ tokenType, active, onClick }) => {
  const isSol = isSolTokenType(tokenType)
  const isBanxSol = isBanxSolTokenType(tokenType)

  //? Remove paddings in svg for USDC and SOL tokens. We need to do it in the svg files, but many views will be broken.
  const tokenIcon =
    isSol || isBanxSol ? <SOL viewBox="-1 -1 18 18" /> : <USDC viewBox="1 1 14 14" />

  const tokenTicker = isSol ? 'SOL' : isBanxSol ? 'banxSOL' : 'USDC'

  return (
    <div
      className={classNames(styles.token, {
        [styles.tokenActive]: active,
      })}
      onClick={onClick}
    >
      <p className={styles.tokenValue}>
        <div
          className={classNames(styles.tokenValueWrapper, {
            [styles.tokenValueSolWrapper]: isSol || isBanxSol,
          })}
        >
          {tokenIcon}
        </div>
        <span className={styles.tokenTicker}>{tokenTicker}</span>
      </p>
    </div>
  )
}

type TokenSwitcherProps = {
  className?: string
}
const TokenSwitcher: FC<TokenSwitcherProps> = ({ className }) => {
  const { tokenType, setTokenType } = useTokenType()

  return (
    <div className={classNames(styles.tokenSwitcher, className)}>
      {TOKENS.map((token) => (
        <TokenValue
          active={token === tokenType}
          key={token}
          tokenType={token}
          onClick={() => setTokenType(token)}
        />
      ))}
    </div>
  )
}

export default TokenSwitcher
