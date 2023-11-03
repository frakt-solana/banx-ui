import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan, Offer } from '@banx/api/core'
import { BONDS, SECONDS_IN_HOUR } from '@banx/constants'
import { useWalletLoansAndOffers } from '@banx/pages/LoansPage/hooks'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useLoansOptimistic, useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeBorrowRefinanceAction } from '@banx/transactions/loans'
import {
  calcLoanBorrowedAmount,
  calculateLoanRepayValue,
  enqueueSnackbar,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import styles from './ActionsCell.module.less'

interface RefinanceModalProps {
  loan: Loan
  offer?: Offer
}

export const RefinanceModal: FC<RefinanceModalProps> = ({ loan, offer }) => {
  const { close } = useModal()
  const wallet = useWallet()
  const { connection } = useConnection()

  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clear: clearSelection } = useSelectedLoans()

  const { updateOptimisticOffers } = useWalletLoansAndOffers()

  const isTerminatingStatus = isLoanTerminating(loan)

  const currentLoanBorrowedAmount = calcLoanBorrowedAmount(loan)
  const currentLoanDailyFee = calculateCurrentInterestSolPure({
    loanValue: currentLoanBorrowedAmount,
    startTime: loan.bondTradeTransaction.soldAt,
    currentTime: moment().unix(),
    rateBasePoints: loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })
  const currentLoanDebt = calculateLoanRepayValue(loan)

  const currentSpotPrice = offer?.currentSpotPrice || 0

  const newLoanBorrowedAmount =
    currentSpotPrice - currentSpotPrice * (BONDS.PROTOCOL_FEE_PERCENT / 1e4) || 0

  const newLoanDailyFee = calculateCurrentInterestSolPure({
    loanValue: currentSpotPrice,
    startTime: moment().unix(),
    currentTime: moment().unix() + 24 * SECONDS_IN_HOUR,
    rateBasePoints: (offer?.marketApr || 0) + BONDS.PROTOCOL_REPAY_FEE,
  })
  const newLoanDebt = currentSpotPrice
  const differenceToPay = newLoanBorrowedAmount - currentLoanDebt

  const refinance = () => {
    if (!offer) return
    trackPageEvent('myloans', isTerminatingStatus ? 'refinance' : 'reborrow')
    new TxnExecutor(makeBorrowRefinanceAction, { connection, wallet })
      .addTxnParam({
        loan,
        offer: offer,
      })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.offer && updateOptimisticOffers([result.offer])
        if (result?.loan) {
          updateLoansOptimistic([result.loan], wallet.publicKey?.toBase58() || '')
        }
        clearSelection()
        enqueueSnackbar({
          message: 'Loan successfully refinanced',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RefinanceBorrow',
        })
      })
      .execute()
  }

  return (
    <Modal open onCancel={close}>
      <LoanInfo
        title="Current loan"
        borrowedAmount={currentLoanBorrowedAmount}
        dailyFee={currentLoanDailyFee}
        debt={currentLoanDebt}
        faded
        className={styles.currentLoanInfo}
      />
      <LoanInfo
        title="New loan"
        borrowedAmount={newLoanBorrowedAmount}
        dailyFee={newLoanDailyFee}
        debt={newLoanDebt}
        className={styles.newLoanInfo}
      />

      <LoanDifference difference={differenceToPay} className={styles.difference} />

      <Button className={styles.refinanceModalButton} onClick={refinance} disabled={!offer}>
        {isTerminatingStatus ? 'Extend' : 'Reborrow'}
      </Button>
    </Modal>
  )
}

interface LoanInfoProps {
  title: string
  borrowedAmount: number //? lamports
  dailyFee: number //? lamports
  debt: number //? lamports
  faded?: boolean //? Make gray text color
  className?: string
}

const LoanInfo: FC<LoanInfoProps> = ({
  title,
  borrowedAmount,
  dailyFee,
  debt,
  faded,
  className,
}) => {
  return (
    <div className={classNames(styles.loanInfo, faded && styles.loanInfoFaded, className)}>
      <h5 className={styles.loanInfoTitle}>{title}</h5>
      <div className={styles.loanInfoStats}>
        <div className={styles.loanInfoValue}>
          <p>{createSolValueJSX(borrowedAmount, 1e9, '0◎')}</p>
          <p>Borrowed</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>{createSolValueJSX(dailyFee, 1e9, '0◎')}</p>
          <p>Daily fee</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>{createSolValueJSX(debt, 1e9, '0◎')}</p>
          <p>Debt</p>
        </div>
      </div>
    </div>
  )
}

interface LoanDifferenceProps {
  difference: number //? lamports
  className?: string
}

const LoanDifference: FC<LoanDifferenceProps> = ({ className, difference }) => {
  const isDifferenceNegative = difference < 0

  const subtitle = isDifferenceNegative ? 'Difference you will pay' : 'Difference you will receive'

  return (
    <div className={classNames(styles.loanDifference, className)}>
      <p
        className={classNames(
          styles.loanDifferenceTitle,
          isDifferenceNegative && styles.loanDifferenceTitleRed,
        )}
      >
        {createSolValueJSX(difference, 1e9, '0◎')}
      </p>
      <p className={styles.loanDifferenceSubtitle}>{subtitle}</p>
    </div>
  )
}
