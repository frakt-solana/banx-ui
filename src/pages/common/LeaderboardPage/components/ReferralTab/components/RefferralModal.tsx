import { ChangeEvent, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Modal } from '@banx/components/modals/BaseModal'

import { Cashback, Paste, Warning } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { pasteFromClipboard } from '@banx/utils'

import { ReferralInput } from './ReferralInput'

import styles from '../ReferralTab.module.less'

export const RefferralModal = () => {
  const { close } = useModal()

  const [inputValue, setInputValue] = useState('')

  const onClickInputButton = async () => {
    const text = await pasteFromClipboard()
    setInputValue(text)
  }

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  return (
    <Modal open onCancel={close} width={408}>
      <div className={styles.referralModalContent}>
        <div className={styles.referralModalInfoRow}>
          <Cashback />
          <span>For the first loan you will receive a 100% cashback in $BANX</span>
        </div>
        <div className={styles.referralModalInfoRow}>
          <Cashback />
          <span>You will receive 10% every time your referral pays upfront fee </span>
        </div>
      </div>

      <div className={styles.separateModalLine} />

      <ReferralInput
        label="Add referrer code"
        value={inputValue}
        onChange={onChangeInput}
        actionButton={{ text: 'Paste', icon: Paste, onClick: onClickInputButton }}
      />
      <span className={styles.referrerWallet}>Referrer wallet: HvNC</span>

      <Button className={styles.confirmButton}>Confirm</Button>

      <WarningMessage />
    </Modal>
  )
}

const WarningMessage = () => (
  <div className={styles.warningMessage}>
    <Warning />
    <span>Please be careful, this action cannot be canceled</span>
  </div>
)
