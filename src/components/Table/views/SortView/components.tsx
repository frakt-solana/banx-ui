import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { switchButtonConfigurations } from './constants'

import styles from './SortView.module.less'

export const SwitchModeButtons = ({
  viewState,
  onChange,
}: {
  viewState: string
  onChange: (value: string) => void
}) => (
  <div className={styles.switchButtons}>
    {switchButtonConfigurations.map(({ state, icon }) => (
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
