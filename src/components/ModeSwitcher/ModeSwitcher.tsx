import { FC } from 'react'

import classNames from 'classnames'

import { AssetMode, useAssetMode } from '@banx/store/common'

import styles from './ModeSwitcher.module.less'

type ModeSwitcherProps = {
  className?: string
}

const ModeSwitcher: FC<ModeSwitcherProps> = ({ className }) => {
  const MODES = [AssetMode.Token, AssetMode.NFT]

  const { currentAssetMode, changeAssetMode } = useAssetMode()

  const toggleAssetMode = () => {
    const nextValue = currentAssetMode === AssetMode.NFT ? AssetMode.Token : AssetMode.NFT
    changeAssetMode(nextValue)
  }

  const getLabelByMode = (mode: AssetMode): string => {
    return mode === AssetMode.NFT ? 'NFTs' : 'Tokens'
  }

  return (
    <div className={classNames(styles.modeSwitcher, className)} onClick={toggleAssetMode}>
      {MODES.map((mode) => (
        <div
          key={mode}
          className={classNames(styles.mode, { [styles.active]: mode === currentAssetMode })}
        >
          <span className={styles.label}>{getLabelByMode(mode)}</span>
        </div>
      ))}
    </div>
  )
}

export default ModeSwitcher
