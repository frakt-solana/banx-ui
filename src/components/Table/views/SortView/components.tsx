import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { ViewState } from '../../hooks'
import { buttonConfigurations } from './constants'

import styles from './SortView.module.less'

export const SwitchModeButtons = ({
  viewState,
  onChange,
}: {
  viewState: ViewState
  onChange: (value: ViewState) => void
}) => (
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
