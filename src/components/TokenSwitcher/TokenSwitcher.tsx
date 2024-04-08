import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useToken } from '@banx/store'

import styles from './TokenSwitcher.module.less'

const TOKENS = [LendingTokenType.Usdc, LendingTokenType.NativeSol]

const TOKEN_ICON = {
  [LendingTokenType.Usdc]: USDC,
  [LendingTokenType.NativeSol]: SOL,
}

const TokenSwitcher = () => {
  const { token, toggleToken } = useToken()

  return (
    <div className={styles.tokenSwitcher}>
      {TOKENS.map((tokenType) => {
        const TokenIcon = TOKEN_ICON[tokenType]

        return (
          <div
            key={tokenType}
            onClick={toggleToken}
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
