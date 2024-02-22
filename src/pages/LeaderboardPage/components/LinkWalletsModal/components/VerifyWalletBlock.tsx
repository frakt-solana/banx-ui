import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'

import { useLinkWalletsModal } from '../hooks'

import styles from '../LinkWalletsModal.module.less'

export const VerifyWalletBlock: FC = () => {
  const { ledgerState, onLogin, banxLoginState } = useLinkWalletsModal()
  const { isLedger, setIsLedger } = ledgerState
  const { isLoggingIn } = banxLoginState

  const [loggingStarted, setLoggingStarted] = useState(false)

  const login = async () => {
    try {
      setLoggingStarted(true)
      await onLogin()
    } finally {
      setLoggingStarted(false)
    }
  }

  //? To show loading immediately after the 'Verify' button click
  const isLoading = isLoggingIn || loggingStarted

  return (
    <div className={styles.verifyWalletBlock}>
      <p className={styles.explanation}>Verify wallet to start linking</p>
      <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
      <Button onClick={login} loading={isLoading}>
        Verify wallet
      </Button>
    </div>
  )
}
