import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useTokenType } from '@banx/store'
import { isSolTokenType } from '@banx/utils'

import styles from './TokenSwitcher.module.less'

const TOKENS = [LendingTokenType.Usdc, LendingTokenType.NativeSol]

const TOKEN_ICON = {
  [LendingTokenType.Usdc]: USDC,
  [LendingTokenType.NativeSol]: SOL,
}

const TokenSwitcher = () => {
  const { tokenType, setTokenType } = useTokenType()

  const toggleTokenType = () => {
    const nextTokenType = isSolTokenType(tokenType)
      ? LendingTokenType.Usdc
      : LendingTokenType.NativeSol

    setTokenType(nextTokenType)
  }
  return (
    <div className={styles.tokenSwitcher}>
      {TOKENS.map((token) => {
        const TokenIcon = TOKEN_ICON[token]

        return (
          <div
            key={token}
            onClick={toggleTokenType}
            className={classNames(styles.token, {
              [styles.active]: token === tokenType,
            })}
          >
            <TokenIcon />
          </div>
        )
      })}
    </div>
  )
}

export default TokenSwitcher
