import classNames from 'classnames'

import { SOL, USDC } from '@banx/icons'
import { TokenType, useToken } from '@banx/store'

import styles from './TokenSwitcher.module.less'

const TokenSwitcher = () => {
  const { token, toggleToken } = useToken()

  const tokens = [TokenType.USDC, TokenType.SOL]
  const tokenIcon = { [TokenType.USDC]: USDC, [TokenType.SOL]: SOL }

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
