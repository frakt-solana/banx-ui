import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { customEpochFormatCountdownUnits } from '@banx/components/EpochProgressBar'
import { StatInfo } from '@banx/components/StatInfo'
import Timer from '@banx/components/Timer'
import { Modal } from '@banx/components/modals/BaseModal'

import { BanxSOL } from '@banx/icons'

import styles from './BanxSolYieldWarningModal.module.less'

type EpochInfo = {
  value: string
  endsAt: number //? Unix timestamp
}

type BanxSolYieldWarningModalProps = {
  onCancel: () => void
  onConfirm: () => void
  currentEpochInfo: EpochInfo
  nextEpochInfo: EpochInfo
}

export const BanxSolYieldWarningModal: FC<BanxSolYieldWarningModalProps> = ({
  onConfirm,
  onCancel,
  currentEpochInfo,
  nextEpochInfo,
}) => {
  return (
    <Modal open onCancel={onCancel} maskClosable={false} width={500}>
      <div className={styles.content}>
        <h2 className={styles.title}>LST yield status</h2>
        <div className={styles.body}>
          <EpochColumn title="This epoch" info={currentEpochInfo} />
          <EpochColumn title="Next epoch" info={nextEpochInfo} />
        </div>
        <div className={styles.footer}>
          <p className={styles.footerText}>
            By withdrawing now, you will lose the pending LST yield
          </p>
          <div className={styles.footerBtns}>
            <Button className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </Button>
            <Button className={styles.confirmBtn} onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const EpochColumn: FC<{ title: string; info: EpochInfo }> = ({ title, info }) => {
  return (
    <div className={styles.epochCol}>
      <h5 className={styles.epochTitle}>{title}</h5>
      <StatInfo
        value={info.value}
        icon={BanxSOL}
        classNamesProps={{
          value: styles.epochAmount,
        }}
      />
      <div className={styles.epochTimer}>
        <h5 className={styles.epochTimerTitle}>Available in:</h5>
        <Timer expiredAt={info.endsAt} formatCountdownUnits={customEpochFormatCountdownUnits} />
      </div>
    </div>
  )
}
