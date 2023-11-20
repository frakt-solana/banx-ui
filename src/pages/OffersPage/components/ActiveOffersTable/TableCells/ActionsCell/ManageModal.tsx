import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'
import {
  HealthColorIncreasing,
  calculateLoanRepayValue,
  getColorByPercent,
  trackPageEvent,
} from '@banx/utils'

import styles from './ActionsCell.module.less'

interface ManageModalProps {
  loan: Loan
  onTerminate?: () => void
  onInstant?: () => void
}

export const ManageModal: FC<ManageModalProps> = ({ loan, onTerminate, onInstant }) => {
  const { close } = useModal()

  const modalTabs: Tab[] = [
    {
      label: 'Repayment call',
      value: 'repayment',
    },
    {
      label: 'Closure',
      value: 'closure',
      disabled: !onTerminate && !onInstant,
    },
  ]

  const {
    tabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({
    tabs: modalTabs,
    defaultValue: modalTabs[0].value,
  })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      <Tabs className={styles.tabs} tabs={tabs} value={tabValue} setValue={setTabValue} />

      {tabValue === modalTabs[0].value && <RepaymentCallContent loan={loan} close={close} />}
      {tabValue !== modalTabs[0].value && (
        <ClosureContent onInstant={onInstant} onTerminate={onTerminate} />
      )}
    </Modal>
  )
}

interface ClosureContentProps {
  onTerminate?: () => void
  onInstant?: () => void
}
const ClosureContent: FC<ClosureContentProps> = ({ onTerminate, onInstant }) => {
  return (
    <div className={styles.closureContent}>
      <div
        className={classNames(styles.modalContent, styles.twoColumnsContent, styles.closureTexts)}
      >
        <h3>Exit</h3>
        <h3>Terminate</h3>
        <p>Instantly receive your total claim</p>
        <p>
          Send your loan to refinancing auction to seek new lenders. If unsuccessful after 72 hours,
          you will receive the collateral instead
        </p>
      </div>

      <div className={classNames(styles.modalContent, styles.contentBorderTop)}>
        <div className={styles.twoColumnsContent}>
          <Button onClick={onInstant} disabled={!onInstant} variant="secondary">
            Exit
          </Button>
          <Button
            className={styles.terminateButton}
            onClick={onTerminate}
            disabled={!onTerminate}
            variant="secondary"
          >
            Terminate
          </Button>
        </div>
      </div>
    </div>
  )
}

interface RepaymentCallContentProps {
  loan: Loan
  close: () => void
}
const RepaymentCallContent: FC<RepaymentCallContentProps> = ({ loan, close }) => {
  const DEFAULT_PERCENT_VALUE = 25

  const totalClaim = calculateLoanRepayValue(loan)
  const initialRepayValue = totalClaim * (DEFAULT_PERCENT_VALUE / 100)

  const [partialPercent, setPartialPercent] = useState<number>(DEFAULT_PERCENT_VALUE)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setPaybackValue((totalClaim * percentValue) / 100)
  }

  const remainingDebt = totalClaim - paybackValue

  const ltv = (remainingDebt / loan.nft.collectionFloor) * 100
  const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

  const onSend = () => {
    try {
      //TODO send repayment call logic here
      trackPageEvent('myoffers', 'activetab-repaymentcall')
    } finally {
      close()
    }
  }

  return (
    <div className={styles.modalContent}>
      <StatInfo
        flexType="row"
        label="Total claim:"
        value={totalClaim}
        divider={1e9}
        classNamesProps={{ container: styles.repaymentCallInfo }}
      />
      <Slider value={partialPercent} onChange={onPartialPercentChange} />
      <div className={styles.repaimentCallAdditionalInfo}>
        <StatInfo flexType="row" label="Repay value" value={paybackValue} divider={1e9} />
        <StatInfo flexType="row" label="Remaining debt" value={remainingDebt} divider={1e9} />
        <StatInfo
          flexType="row"
          label="New LTV"
          value={ltv}
          valueStyles={{ color: colorLTV }}
          valueType={VALUES_TYPES.PERCENT}
        />
      </div>
      <Button className={styles.repaymentCallButton} onClick={onSend} disabled={!partialPercent}>
        Send
      </Button>
    </div>
  )
}
