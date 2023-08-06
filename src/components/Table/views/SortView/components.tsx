import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { ViewState } from '@banx/store'

import { buttonConfigurations } from './constants'

import styles from './SortView.module.less'

interface SwitchModeButtonsProps {
  viewState: ViewState
  onChange: (value: ViewState) => void
}

export const SwitchModeButtons: FC<SwitchModeButtonsProps> = ({ viewState, onChange }) => (
  <div className={styles.switchButtons}>
    {buttonConfigurations.map(({ state, icon }) => (
      <Button
        key={state}
        type="circle"
        variant="secondary"
        className={classNames(styles.switchViewButton, {
          [styles.active]: viewState === state,
        })}
        onClick={() => onChange(state)}
      >
        {icon}
      </Button>
    ))}
  </div>
)
