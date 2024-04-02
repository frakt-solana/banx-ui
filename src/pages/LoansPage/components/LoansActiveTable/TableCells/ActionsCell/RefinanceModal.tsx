import { FC, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { BONDS, SEND_TXN_MAX_RETRIES } from '@banx/constants'
import { useMarketOffers } from '@banx/pages/LendPage'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeBorrowRefinanceAction } from '@banx/transactions/loans'
import {
  calcLoanBorrowedAmount,
  calculateApr,
  calculateLoanRepayValue,
  enqueueSnackbar,
  filterOutWalletLoans,
  findSuitableOffer,
  isLoanTerminating,
  isOfferNotEmpty,
  trackPageEvent,
  usePriorityFees,
} from '@banx/utils'

import styles from './ActionsCell.module.less'

interface RefinanceModalProps {
  loan: Loan
}

export const RefinanceModal: FC<RefinanceModalProps> = ({ loan }) => {
  const { close } = useModal()
  const wallet = useWallet()
  const { connection } = useConnection()

  const priorityFees = usePriorityFees()

  const { bondTradeTransaction, fraktBond, nft } = loan

  const { offers, isLoading } = useMarketOffers({
    marketPubkey: fraktBond.hadoMarket,
  })

  const bestOffer = useMemo(() => {
    return chain(offers)
      .sortBy(({ currentSpotPrice }) => currentSpotPrice)
      .filter(isOfferNotEmpty)
      .reverse()
      .value()
      .at(0)
  }, [offers])

  const initialCurrentSpotPrice = useMemo(() => {
    if (!bestOffer) return 0
    return bestOffer.currentSpotPrice
  }, [bestOffer])

  useEffect(() => {
    setCurrentSpotPrice(initialCurrentSpotPrice)
  }, [initialCurrentSpotPrice])

  // const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clear: clearSelection } = useSelectedLoans()

  const isTerminatingStatus = isLoanTerminating(loan)

  const [partialPercent, setPartialPercent] = useState<number>(100)
  const [currentSpotPrice, setCurrentSpotPrice] = useState<number>(initialCurrentSpotPrice)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setCurrentSpotPrice(Math.max(Math.floor((initialCurrentSpotPrice * percentValue) / 100), 1000))
  }

  const upfrontFee = currentSpotPrice / 100

  const currentLoanBorrowedAmount = calcLoanBorrowedAmount(loan)
  const currentLoanDebt = calculateLoanRepayValue(loan)
  const currentApr = bondTradeTransaction.amountOfBonds

  const newLoanBorrowedAmount = currentSpotPrice - upfrontFee
  const newLoanDebt = currentSpotPrice

  const newApr = calculateApr({
    loanValue: newLoanBorrowedAmount,
    collectionFloor: nft.collectionFloor,
    marketPubkey: fraktBond.hadoMarket,
  })

  const differenceToPay = newLoanDebt - currentLoanDebt - upfrontFee

  const refinance = () => {
    if (!bestOffer) return
    trackPageEvent('myloans', isTerminatingStatus ? 'refinance' : 'reborrow')

    const suitableOffer = chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({
          offers,
          walletPubkey: wallet?.publicKey?.toBase58(),
        }),
      )
      .thru((offers) =>
        findSuitableOffer({
          loanValue: currentSpotPrice,
          offers,
        }),
      )
      .value()

    if (!suitableOffer) return

    new TxnExecutor(
      makeBorrowRefinanceAction,
      { connection, wallet },
      { maxRetries: SEND_TXN_MAX_RETRIES },
    )
      .addTxnParam({
        loan,
        offer: suitableOffer,
        solToRefinance: currentSpotPrice,
        aprRate: newApr,
        priorityFees,
      })
      // .on('pfSuccessEach', (results) => {
      //   const { result, txnHash } = results[0]
      //   result?.offer && updateOrAddOffer(result.offer)
      //   if (result?.loan) {
      //     updateLoansOptimistic([result.loan], wallet.publicKey?.toBase58() || '')
      //   }
      //   clearSelection()
      //   enqueueSnackbar({
      //     message: 'Loan successfully refinanced',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${txnHash}`,
      //   })
      //   close()
      // })
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]

        clearSelection()
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
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
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          <LoanInfo
            title="Current loan"
            borrowedAmount={currentLoanBorrowedAmount}
            debt={currentLoanDebt}
            apr={currentApr}
            className={styles.currentLoanInfo}
            faded
          />
          <LoanInfo
            title="New loan"
            borrowedAmount={newLoanBorrowedAmount}
            debt={newLoanDebt}
            apr={newApr}
            className={styles.newLoanInfo}
          />

          <LoanDifference difference={differenceToPay} className={styles.difference} />

          <Slider
            label="Loan"
            value={partialPercent}
            onChange={onPartialPercentChange}
            className={styles.refinanceModalSlider}
            marks={DEFAULT_SLIDER_MARKS}
            min={10}
            max={100}
          />

          <Button className={styles.refinanceModalButton} onClick={refinance} disabled={!bestOffer}>
            {isTerminatingStatus ? 'Extend' : 'Reborrow'}
          </Button>
        </>
      )}
    </Modal>
  )
}

const DEFAULT_SLIDER_MARKS = {
  10: '10%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

interface LoanInfoProps {
  title: string
  borrowedAmount: number //? lamports
  debt: number //? lamports
  apr: number //? base points
  faded?: boolean //? Make gray text color
  className?: string
}

const LoanInfo: FC<LoanInfoProps> = ({ title, borrowedAmount, debt, apr, faded, className }) => {
  return (
    <div className={classNames(styles.loanInfo, faded && styles.loanInfoFaded, className)}>
      <h5 className={styles.loanInfoTitle}>{title}</h5>
      <div className={styles.loanInfoStats}>
        <div className={styles.loanInfoValue}>
          <p>{createSolValueJSX(borrowedAmount, 1e9, '0◎')}</p>
          <p>Borrowed</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>{createPercentValueJSX((apr + BONDS.PROTOCOL_REPAY_FEE) / 100)}</p>
          <p>APR</p>
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
