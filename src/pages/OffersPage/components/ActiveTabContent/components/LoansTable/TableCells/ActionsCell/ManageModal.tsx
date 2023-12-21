import { FC, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useMarketOffers } from '@banx/pages/LendPage'
import { findBestOffer, useHiddenNftsMints, useLenderLoans } from '@banx/pages/OffersPage'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeInstantRefinanceAction, makeTerminateAction } from '@banx/transactions/loans'
import {
  HealthColorIncreasing,
  calculateLoanRepayValue,
  enqueueSnackbar,
  getColorByPercent,
  isLoanActiveOrRefinanced,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import styles from './ActionsCell.module.less'

interface ManageModalProps {
  loan: Loan
}

export const ManageModal: FC<ManageModalProps> = ({ loan }) => {
  const { close } = useModal()

  const modalTabs: Tab[] = [
    {
      label: 'Repayment call',
      value: 'repayment',
      disabled: true, //TODO enable when repayment call implemented
    },
    {
      label: 'Closure',
      value: 'closure',
      // disabled: !onTerminate && !onInstant,
    },
  ]

  const defaultTabValue = modalTabs[1].value

  const {
    tabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({
    tabs: modalTabs,
    defaultValue: defaultTabValue,
  })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      <Tabs className={styles.tabs} tabs={tabs} value={tabValue} setValue={setTabValue} />

      {tabValue === modalTabs[0].value && <RepaymentCallContent loan={loan} close={close} />}
      {tabValue === modalTabs[1].value && <ClosureContent loan={loan} />}
    </Modal>
  )
}

interface ClosureContentProps {
  loan: Loan
}
const ClosureContent: FC<ClosureContentProps> = ({ loan }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { updateOrAddLoan } = useLenderLoans()
  const { addMints: hideLoans } = useHiddenNftsMints()

  const { offers, updateOrAddOffer, isLoading } = useMarketOffers({
    marketPubkey: loan.fraktBond.hadoMarket,
  })

  const bestOffer = useMemo(() => {
    return findBestOffer({ loan, offers, walletPubkey: wallet?.publicKey?.toBase58() || '' })
  }, [offers, loan, wallet])

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const hasRefinanceOffers = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffers && loanActiveOrRefinanced
  const canTerminate = !isLoanTerminating(loan) && loanActiveOrRefinanced

  const terminateLoan = () => {
    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        updateOrAddLoan({ ...loan, ...result })
        enqueueSnackbar({
          message: 'Offer termination successfully initialized',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const instantLoan = () => {
    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParam({ loan, bestOffer })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        hideLoans(loan.nft.mint)
        enqueueSnackbar({
          message: 'Offer successfully sold',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RefinanceInstant',
        })
      })
      .execute()
  }

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

      <div className={styles.modalContent}>
        {isLoading && <Loader />}
        {!isLoading && (
          <div className={styles.twoColumnsContent}>
            <Button onClick={instantLoan} disabled={!canRefinance} variant="secondary">
              {canRefinance ? 'Exit' : 'No suitable offers yet'}
            </Button>
            <Button
              className={styles.terminateButton}
              onClick={terminateLoan}
              disabled={!canTerminate}
              variant="secondary"
            >
              Terminate
            </Button>
          </div>
        )}
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