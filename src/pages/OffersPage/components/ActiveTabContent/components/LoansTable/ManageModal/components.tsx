import { FC, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, isEmpty, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'

import { core } from '@banx/api/nft'
import { useMarketOffers } from '@banx/pages/LendPage'
import { calculateClaimValue, useLenderLoans } from '@banx/pages/OffersPage'
import { useModal, useTokenType } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createInstantRefinanceTxnData,
  createRepaymentCallTxnData,
  createTerminateTxnData,
} from '@banx/transactions/loans'
import {
  HealthColorIncreasing,
  calculateApr,
  calculateFreezeExpiredAt,
  calculateLoanRepayValue,
  calculateRepaymentCallLenderReceivesAmount,
  checkIfFreezeExpired,
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
  isLoanActiveOrRefinanced,
  isLoanRepaymentCallActive,
  isLoanTerminating,
} from '@banx/utils'

import { useSelectedLoans } from '../loansState'

import styles from './ManageModal.module.less'

interface ClosureContentProps {
  loan: core.Loan
}
export const ClosureContent: FC<ClosureContentProps> = ({ loan }) => {
  const { connection } = useConnection()
  const wallet = useWallet()

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

  const terminateLoan = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createTerminateTxnData({
        loan,
        walletAndConnection,
      })

      await new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Terminate',
      })
    }
  }

  const instantLoan = async () => {
    if (!bestOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const aprRate = calculateApr({
        loanValue: calculateClaimValue(loan),
        collectionFloor: loan.nft.collectionFloor,
        marketPubkey: loan.fraktBond.hadoMarket,
      })

      const txnData = await createInstantRefinanceTxnData({
        loan,
        bestOffer,
        walletAndConnection,
        aprRate,
      })

      await new TxnExecutor<core.Offer>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
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

              updateOrAddOffer(result)
              hideLoans(loan.nft.mint)
              close()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RefinanceInstant',
      })
    }
  }

  const totalClaimValue = calculateClaimValue(loan)
  const tokenUnit = getTokenUnit(tokenType)

  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const isFreezeExpired = checkIfFreezeExpired(loan)

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
      {isFreezeExpired && (
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
      {!isFreezeExpired && (
        <div className={styles.freezeTimerWrapper}>
          Exit and termination are frozen for <Timer expiredAt={freezeExpiredAt} />
        </div>
      )}
    </div>
  )
}

interface RepaymentCallContentProps {
  loan: core.Loan
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
    const callAmount = Math.floor((calculateLoanRepayValue(loan) * repayPercent) / 100)

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRepaymentCallTxnData({
        loan,
        callAmount,
        walletAndConnection,
      })

      await new TxnExecutor<core.Loan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: { loan, callAmount },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepaymentCall',
      })
    }
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

export const calculateRepaymentStaticValues = (loan: core.Loan) => {
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
