import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useToken } from '@banx/store'

import styles from './TokenSwitcher.module.less'

const TokenSwitcher = () => {
  const { token, toggleToken } = useToken()

  const tokens = [LendingTokenType.USDC, LendingTokenType.NativeSOL]
  const tokenIcon = { [LendingTokenType.USDC]: USDC, [LendingTokenType.NativeSOL]: SOL }

  return (
    <div className={styles.tokenSwitcher}>
      {tokens.map((tokenType) => {
        const TokenIcon = tokenIcon[tokenType]

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
