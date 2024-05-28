import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SOL, USDC } from '@banx/icons'
import { useNftTokenType } from '@banx/store/nft'
import { TokenType, useTokenType } from '@banx/store/token'
import { isSolTokenType } from '@banx/utils'

import styles from './TokenSwitcher.module.less'

type NftTokenValueProps = {
  active?: boolean
  tokenType: LendingTokenType
}

const NFT_TOKENS = [LendingTokenType.NativeSol, LendingTokenType.Usdc]

const NftTokenValue: FC<NftTokenValueProps> = ({ tokenType, active }) => {
  const isSol = isSolTokenType(tokenType)

  //? Remove paddings in svg for USDC and SOL tokens. We need to do it in the svg files, but many views will be broken.
  const tokenIcon = isSol ? <SOL viewBox="-1 -1 18 18" /> : <USDC viewBox="1 1 14 14" />

  const tokenTicker = isSol ? 'SOL' : 'USDC'

  return (
    <div className={classNames(styles.nftTokenWrapper, { [styles.active]: active })}>
      <p className={styles.tokenValue}>
        <div
          className={classNames(styles.tokenIconWrapper, { [styles.tokenIconSolWrapper]: isSol })}
        >
          {tokenIcon}
        </div>
        <span className={styles.tokenTicker}>{tokenTicker}</span>
      </p>
    </div>
  )
}

type NftTokenSwitcherProps = {
  className?: string
}

export const NftTokenSwitcher: FC<NftTokenSwitcherProps> = ({ className }) => {
  const { tokenType, setTokenType } = useNftTokenType()

  const toggleTokenType = () => {
    const nextTokenType = isSolTokenType(tokenType)
      ? LendingTokenType.Usdc
      : LendingTokenType.NativeSol

    setTokenType(nextTokenType)
  }
  return (
    <div className={classNames(styles.nftTokenSwitcher, className)} onClick={toggleTokenType}>
      {NFT_TOKENS.map((token) => (
        <NftTokenValue active={token === tokenType} key={token} tokenType={token} />
      ))}
    </div>
  )
}

type TokenSwitcherProps = {
  className?: string
}

const TOKEN_DETAILS = {
  [TokenType.SOL]: {
    unit: <SOL />,
    label: 'SOL',
  },
  [TokenType.USDC]: {
    unit: <USDC />,
    label: 'USDC',
  },
  [TokenType.ALL]: {
    unit: null,
    label: 'ALL',
  },
}

export const TokenSwitcher: FC<TokenSwitcherProps> = ({ className }) => {
  const { tokenType, setTokenType } = useTokenType()

  const tokens = Object.keys(TOKEN_DETAILS) as TokenType[]

  return (
    <div className={classNames(styles.tokenSwitcher, className)}>
      {tokens.map((token) => {
        const { unit: tokenIcon, label } = TOKEN_DETAILS[token]

        return (
          <div
            key={token}
            onClick={() => setTokenType(token)}
            className={classNames(styles.tokenWrapper, { [styles.active]: token === tokenType })}
          >
            <p className={styles.tokenValue}>
              {tokenIcon && <div className={styles.tokenIconWrapper}>{tokenIcon}</div>}
              <span className={styles.tokenTicker}>{label}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
