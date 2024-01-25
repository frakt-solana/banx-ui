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
import { calculateClaimValue, findBestOffer, useLenderLoans } from '@banx/pages/OffersPage'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeInstantRefinanceAction,
  makeRepaymentCallAction,
  makeTerminateAction,
} from '@banx/transactions/loans'
import {
  HealthColorIncreasing,
  enqueueSnackbar,
  formatDecimal,
  getColorByPercent,
  isLoanActiveOrRefinanced,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { calculateRepaymentStaticValues } from './helpers'

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
    },
    {
      label: 'Closure',
      value: 'closure',
    },
  ]
  const defaultTabValue = modalTabs[0].value
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
  const { close } = useModal()

  const { updateOrAddLoan, addMints: hideLoans } = useLenderLoans()

  const { offers, updateOrAddOffer, isLoading } = useMarketOffers({
    marketPubkey: loan.fraktBond.hadoMarket,
  })

  const bestOffer = useMemo(() => {
    return findBestOffer({ loan, offers, walletPubkey: wallet?.publicKey?.toBase58() || '' })
  }, [offers, loan, wallet])

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const hasRefinanceOffer = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffer && loanActiveOrRefinanced
  const canTerminate = !isLoanTerminating(loan) && loanActiveOrRefinanced

  const totalClaimValue = calculateClaimValue(loan)
  const formattedClaimValue = `+${formatDecimal(totalClaimValue / 1e9)}◎`

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
          Send your loan to refinancing auction to seek new lenders. If successful, you will receive
          SOL in your wallet. If unsuccessful after 72 hours you will receive the collateral instead
        </p>
      </div>

      <div className={styles.modalContent}>
        {isLoading && <Loader />}
        {!isLoading && (
          <div className={styles.twoColumnsContent}>
            <Button onClick={instantLoan} disabled={!canRefinance} variant="secondary">
              {canRefinance ? `Exit ${formattedClaimValue}` : 'No suitable offers yet'}
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
  const wallet = useWallet()
  const { connection } = useConnection()
  const { updateOrAddLoan } = useLenderLoans()

  const { repaymentCallExists, totalClaim, initialRepayPercent, initialRepayValue } =
    calculateRepaymentStaticValues(loan)

  const [repayPercent, setRepayPercent] = useState<number>(initialRepayPercent)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setRepayPercent(percentValue)
    setPaybackValue(Math.floor((totalClaim * percentValue) / 100))
  }

  const remainingDebt = totalClaim - paybackValue

  const ltv = (remainingDebt / loan.nft.collectionFloor) * 100
  const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

  const sendBtnDisabled =
    !repayPercent || (repaymentCallExists && initialRepayValue === paybackValue)

  const onSend = async () => {
    trackPageEvent('myoffers', 'activetab-repaymentcall')

    const txnParam = {
      loan,
      callAmount: paybackValue,
    }

    await new TxnExecutor(makeRepaymentCallAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessAll', (results) => {
        const { result, txnHash } = results[0]

        if (result && wallet.publicKey) {
          updateOrAddLoan(result)
        }
        enqueueSnackbar({
          message: 'Repayment call initialized',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })

        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RepaymentCall',
        })
      })
      .execute()
  }

  return (
    <div className={styles.modalContent}>
      <Slider value={repayPercent} onChange={onPartialPercentChange} />
      <div className={styles.repaimentCallAdditionalInfo}>
        <StatInfo flexType="row" label="Ask borrower to repay" value={paybackValue} divider={1e9} />
        <StatInfo flexType="row" label="Debt after repayment" value={remainingDebt} divider={1e9} />
        <StatInfo
          flexType="row"
          label="Ltv after repayment"
          value={ltv}
          valueStyles={{ color: colorLTV }}
          valueType={VALUES_TYPES.PERCENT}
        />
      </div>
      <Button className={styles.repaymentCallButton} onClick={onSend} disabled={sendBtnDisabled}>
        {!repaymentCallExists ? 'Send' : 'Update'}
      </Button>
    </div>
  )
}
