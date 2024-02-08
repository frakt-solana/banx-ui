import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { CardView, TableView } from '@banx/icons'
import { ViewState } from '@banx/store'

import styles from './SortView.module.less'

interface SwitchModeButtonProps {
  viewState: ViewState
  onChange: (value: ViewState) => void
}

export const SwitchModeButton: FC<SwitchModeButtonProps> = ({ viewState, onChange }) => {
  const Icon = viewState === ViewState.CARD ? <CardView /> : <TableView />

  const onToggleViewMode = () =>
    onChange(viewState === ViewState.CARD ? ViewState.TABLE : ViewState.CARD)

  return (
    <Button
      type="circle"
      variant="secondary"
      className={styles.switchViewButton}
      onClick={onToggleViewMode}
    >
      {Icon}
    </Button>
  )
}
