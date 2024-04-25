import { FC, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, isEmpty, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useMarketOffers } from '@banx/pages/LendPage'
import { calculateClaimValue, useLenderLoans } from '@banx/pages/OffersPage'
import { useModal, usePriorityFees, useTokenType } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeInstantRefinanceAction,
  makeRepaymentCallAction,
  makeTerminateAction,
} from '@banx/transactions/loans'
import {
  HealthColorIncreasing,
  calculateLoanRepayValue,
  calculateRepaymentCallLenderReceivesAmount,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  filterOutWalletLoans,
  findSuitableOffer,
  formatValueByTokenType,
  getColorByPercent,
  getTokenUnit,
  isFreezeLoan,
  isLoanActiveOrRefinanced,
  isLoanRepaymentCallActive,
  isLoanTerminating,
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

  const { tokenType } = useTokenType()

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
      { wallet: createWalletInstance(wallet), connection },
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

  const totalClaimValue = calculateClaimValue(loan)
  const tokenUnit = getTokenUnit(tokenType)

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
      {!isFreezeLoan(loan) && (
        <div className={styles.modalContent}>
          {isLoading && <Loader />}
          {!isLoading && (
            <div className={styles.twoColumnsContent}>
              <Button onClick={instantLoan} disabled={!canRefinance} variant="secondary">
                {canRefinance ? (
                  <div className={styles.exitValue}>
                    Exit +{formatValueByTokenType(totalClaimValue, tokenType)}
                    {tokenUnit}
                  </div>
                ) : (
                  'No suitable offers yet'
                )}
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
      )}
      {isFreezeLoan(loan) && (
        <EmptyList
          className={styles.emptyList}
          message="Exit and termination are frozen for 11d : 17m"
        />
      )}
    </div>
  )
}

interface RepaymentCallContentProps {
  loan: Loan
  close: () => void
}

export const RepaymentCallContent: FC<RepaymentCallContentProps> = ({ loan, close }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { updateOrAddLoan } = useLenderLoans()

  const { repaymentCallActive, totalClaim, initialRepayPercent, initialRepayValue } =
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
    !repayPercent || (repaymentCallActive && initialRepayValue === paybackValue)

  const onSend = async () => {
    const loadingSnackbarId = uniqueId()

    const callAmount = Math.floor((calculateLoanRepayValue(loan) * repayPercent) / 100)
    const txnParam = { loan, callAmount }

    await new TxnExecutor(
      makeRepaymentCallAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParam(txnParam)
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
          if (result && wallet.publicKey) {
            enqueueSnackbar({
              message: 'Repayment call initialized',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddLoan(result)
            close()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
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
      <Slider
        value={repayPercent}
        onChange={onPartialPercentChange}
        marks={DEFAULT_SLIDER_MARKS}
        max={MAX_SLIDER_VALUE}
      />
      <div className={styles.repaimentCallAdditionalInfo}>
        <StatInfo
          label="Ask borrower to repay"
          value={<DisplayValue value={paybackValue} />}
          flexType="row"
        />
        <StatInfo
          label="Debt after repayment"
          value={<DisplayValue value={remainingDebt} />}
          flexType="row"
        />
        <StatInfo
          label="Ltv after repayment"
          value={ltv}
          valueStyles={{ color: colorLTV }}
          valueType={VALUES_TYPES.PERCENT}
          flexType="row"
        />
      </div>
      <Button className={styles.repaymentCallButton} onClick={onSend} disabled={sendBtnDisabled}>
        {!repaymentCallActive ? 'Send' : 'Update'}
      </Button>
    </div>
  )
}

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const DEFAULT_REPAY_PERCENT = 50

  const repaymentCallActive = isLoanRepaymentCallActive(loan)

  const repaymentCallLenderReceives = calculateRepaymentCallLenderReceivesAmount(loan)

  const totalClaim = calculateClaimValue(loan)

  const initialRepayPercent = repaymentCallActive
    ? (repaymentCallLenderReceives / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallActive
    ? repaymentCallLenderReceives
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallActive,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}

const MAX_SLIDER_VALUE = 90
const DEFAULT_SLIDER_MARKS = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  90: '90%',
}
