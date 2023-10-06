import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan, Offer } from '@banx/api/core'
import { useWalletLoansAndOffers } from '@banx/pages/LoansPage/hooks'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useLoansOptimistic, useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeBorrowRefinanceAction } from '@banx/transactions/loans'
import { enqueueSnackbar, isLoanTerminating } from '@banx/utils'

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
  const { clearSelection } = useSelectedLoans()

  const { updateOptimisticOffers } = useWalletLoansAndOffers()

  const refinance = () => {
    if (!offer) return
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
          message: 'Transaction Executed',
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

  const isTerminatingStatus = isLoanTerminating(loan)

  return (
    <Modal open onCancel={close}>
      <LoanInfo
        title="Current loan"
        borrowedAmount={13.65 * 1e9}
        dailyFee={0.18 * 1e9}
        debt={14.91 * 1e9}
        faded
        className={styles.currentLoanInfo}
      />
      <LoanInfo
        title="New loan"
        borrowedAmount={13.65 * 1e9}
        dailyFee={0.18 * 1e9}
        debt={14.91 * 1e9}
        className={styles.newLoanInfo}
      />

      <LoanDifference difference={0.13 * 1e9} className={styles.difference} />

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
      <p className={styles.loanDifferenceSubtitle}>Difference you will pay</p>
    </div>
  )
}
