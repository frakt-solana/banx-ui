import { FC } from 'react'

import classNames from 'classnames'

import { ModeType, useModeType } from '@banx/store/common'

import styles from './ModeSwitcher.module.less'

const MODES = [ModeType.NFT, ModeType.Token]

type ModeSwitcherProps = {
  className?: string
}

const ModeSwitcher: FC<ModeSwitcherProps> = ({ className }) => {
  const { modeType: storeModeType, setModeType } = useModeType()

  const toggleModeType = () => {
    const nextValue = storeModeType === ModeType.NFT ? ModeType.Token : ModeType.NFT
    setModeType(nextValue)
  }

  return (
    <div className={classNames(styles.modeSwitcher, className)} onClick={toggleModeType}>
      {MODES.map((mode) => {
        const label = mode === ModeType.NFT ? 'NFTs' : 'Tokens'

        return (
          <div
            key={mode}
            className={classNames(styles.mode, { [styles.active]: mode === storeModeType })}
          >
            <span className={styles.label}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default ModeSwitcher
