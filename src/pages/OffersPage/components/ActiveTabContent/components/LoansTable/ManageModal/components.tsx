import { FC, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, isEmpty, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useMarketOffers } from '@banx/pages/LendPage'
import { calculateClaimValue, useLenderLoans } from '@banx/pages/OffersPage'
import { useModal, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeInstantRefinanceAction, makeTerminateAction } from '@banx/transactions/loans'
import {
  HealthColorIncreasing,
  calculateLoanRepayValue,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  filterOutWalletLoans,
  findSuitableOffer,
  formatDecimal,
  getColorByPercent,
  isLoanActiveOrRefinanced,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { useSelectedLoans } from '../loansState'

import styles from './ManageModal.module.less'

interface ClosureContentProps {
  loan: Loan
}
export const ClosureContent: FC<ClosureContentProps> = ({ loan }) => {
  const { connection } = useConnection()
  const wallet = useWallet()

  const { priorityLevel } = usePriorityFees()
  const { close } = useModal()

  const { remove: removeLoan } = useSelectedLoans()

  const { updateOrAddLoan, addMints: hideLoans } = useLenderLoans()

  const { offers, updateOrAddOffer, isLoading } = useMarketOffers({
    marketPubkey: loan.fraktBond.hadoMarket,
  })

  const bestOffer = useMemo(() => {
    return chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({ offers, walletPubkey: wallet?.publicKey?.toBase58() }),
      )
      .thru((offers) => findSuitableOffer({ loanValue: calculateLoanRepayValue(loan), offers }))
      .value()
  }, [offers, loan, wallet])

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const hasRefinanceOffer = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffer && loanActiveOrRefinanced
  const canTerminate = !isLoanTerminating(loan) && loanActiveOrRefinanced

  const totalClaimValue = calculateClaimValue(loan)
  const formattedClaimValue = `+${formatDecimal(totalClaimValue / 1e9)}◎`

  const terminateLoan = () => {
    const loadingSnackbarId = uniqueId()

    new TxnExecutor(
      makeTerminateAction,
      { wallet: createWalletInstance(wallet), connection },
      {
        confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS,
      },
    )
      .addTransactionParam({ loan, priorityFeeLevel: priorityLevel })
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result && wallet?.publicKey) {
            enqueueSnackbar({
              message: 'Offer successfully terminated',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddLoan({ ...loan, ...result })
            removeLoan(loan.publicKey, wallet.publicKey.toBase58())
            close()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const instantLoan = () => {
    if (!bestOffer) return

    const loadingSnackbarId = uniqueId()

    new TxnExecutor(
      makeInstantRefinanceAction,
      {
        wallet: createWalletInstance(wallet),
        connection,
      },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParam({ loan, bestOffer, priorityFeeLevel: priorityLevel })
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            enqueueSnackbar({
              message: 'Offer successfully sold',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddOffer(result.bondOffer)
            hideLoans(loan.nft.mint)
            close()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
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
export const RepaymentCallContent: FC<RepaymentCallContentProps> = ({ loan, close }) => {
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