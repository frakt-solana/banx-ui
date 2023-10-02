import { FC, useEffect } from 'react'

import { useDialectWallet } from '@dialectlabs/react-sdk'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'

import { useIsLedger } from '@banx/store'

import { useBanxNotificationsSider } from '../../hooks'

import styles from '../BanxNotificationsSider.module.less'

export const SignMessageScreen: FC = () => {
  const { authorize } = useBanxNotificationsSider()

  const { isLedger, setIsLedger } = useIsLedger()

  const {
    hardwareWalletForcedState: { set: setHardwareWalletForcedState },
  } = useDialectWallet()

  useEffect(() => {
    setHardwareWalletForcedState(isLedger)
  }, [isLedger, setHardwareWalletForcedState])

  return (
    <div className={classNames(styles.content, styles.contentCentered)}>
      <h3 className={styles.contentTitle} style={{ marginBottom: 8 }}>
        Please sign message
      </h3>
      <p className={classNames(styles.signMessageSubtitle, styles.contentTitleSign)}>
        to set up notifications
      </p>
      <Checkbox
        onChange={() => setIsLedger(!isLedger)}
        label="I use ledger"
        checked={isLedger}
        className={styles.ledgerCheckbox}
      />
      <Button onClick={authorize}>Sign</Button>
    </div>
  )
}
