import { FC } from 'react'

import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { useTokenType } from '@banx/store/token'
import { isSolTokenType } from '@banx/utils'

import { TokenDropdown } from './TokenDropdown'
import { NFT_TOKEN_OPTIONS, NFT_TOKEN_VALUE_DETAILS, TOKEN_OPTIONS } from './constants'

import styles from './TokenSwitcher.module.less'

type NftTokenValueProps = {
  active?: boolean
  tokenType: LendingTokenType
}

const NftTokenValue: FC<NftTokenValueProps> = ({ tokenType, active }) => {
  const { icon: tokenIcon, ticker: tokenTicker } = NFT_TOKEN_VALUE_DETAILS[tokenType]
  const isSol = isSolTokenType(tokenType)

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

interface NftTokenSwitcherProps {
  title: string
}

export const NftTokenSwitcher: FC<NftTokenSwitcherProps> = ({ title }) => {
  const { tokenType, setTokenType } = useNftTokenType()

  const { width } = useWindowSize()
  const isTable = width < TABLET_WIDTH

  const toggleTokenType = () => {
    const nextValue = isSolTokenType(tokenType) ? LendingTokenType.Usdc : LendingTokenType.NativeSol
    return setTokenType(nextValue)
  }

  return (
    <>
      {!isTable && (
        <div className={styles.nftTokenSwitcher} onClick={toggleTokenType}>
          {NFT_TOKEN_OPTIONS.map((token) => (
            <NftTokenValue active={token.key === tokenType} key={token.key} tokenType={token.key} />
          ))}
        </div>
      )}

      {isTable && (
        <TokenDropdown
          title={title}
          onChangeToken={setTokenType}
          options={NFT_TOKEN_OPTIONS}
          option={
            NFT_TOKEN_OPTIONS.find((option) => option.key === tokenType) || NFT_TOKEN_OPTIONS[0]
          }
        />
      )}
    </>
  )
}

interface TokenSwitcherProps {
  title: string
}

export const TokenSwitcher: FC<TokenSwitcherProps> = ({ title }) => {
  const { tokenType, setTokenType } = useTokenType()

  const { width } = useWindowSize()
  const isTable = width < TABLET_WIDTH

  return (
    <>
      {!isTable && (
        <div className={styles.tokenSwitcher}>
          {TOKEN_OPTIONS.map((tokenOption) => {
            const { key, unit: tokenIcon, label } = tokenOption

            return (
              <div
                key={key}
                onClick={() => setTokenType(key)}
                className={classNames(styles.tokenWrapper, { [styles.active]: key === tokenType })}
              >
                <p className={styles.tokenValue}>
                  {tokenIcon && <div className={styles.tokenIconWrapper}>{tokenIcon}</div>}
                  <span className={styles.tokenTicker}>{label}</span>
                </p>
              </div>
            )
          })}
        </div>
      )}

      {isTable && (
        <TokenDropdown
          title={title}
          options={TOKEN_OPTIONS}
          option={TOKEN_OPTIONS.find((option) => option.key === tokenType) || TOKEN_OPTIONS[0]}
          onChangeToken={setTokenType}
        />
      )}
    </>
  )
}
