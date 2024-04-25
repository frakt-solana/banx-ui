import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useTokenType } from '@banx/store'
import { isSolTokenType } from '@banx/utils'

import styles from './TokenSwitcher.module.less'

const TOKENS = [LendingTokenType.NativeSol, LendingTokenType.Usdc]

type TokenValueProps = {
  active?: boolean
  tokenType: LendingTokenType
}
const TokenValue: FC<TokenValueProps> = ({ tokenType, active }) => {
  const isSol = isSolTokenType(tokenType)

  //? Remove paddings in svg for USDC and SOL tokens. We need to do it in the svg files, but many views will be broken.
  const tokenIcon = isSol ? <SOL viewBox="-1 -1 18 18" /> : <USDC viewBox="1 1 14 14" />

  const tokenTicker = isSol ? 'SOL' : 'USDC'

  return (
    <div
      className={classNames(styles.token, {
        [styles.tokenActive]: active,
      })}
    >
      <p className={styles.tokenValue}>
        <div
          className={classNames(styles.tokenValueWrapper, { [styles.tokenValueSolWrapper]: isSol })}
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

  const toggleTokenType = () => {
    const nextTokenType = isSolTokenType(tokenType)
      ? LendingTokenType.Usdc
      : LendingTokenType.NativeSol

    setTokenType(nextTokenType)
  }
  return (
    <div className={classNames(styles.tokenSwitcher, className)} onClick={toggleTokenType}>
      {TOKENS.map((token) => (
        <TokenValue active={token === tokenType} key={token} tokenType={token} />
      ))}
    </div>
  )
}

export default TokenSwitcher
