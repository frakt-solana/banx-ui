import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, map, sumBy, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_OPTIONS } from '@banx/constants'
import { useModal } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeRefinanceAction } from '@banx/transactions/loans'
import {
  calcWeightedAverage,
  calculateLoanRepayValue,
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionsError,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getDialectAccessToken,
  trackPageEvent,
} from '@banx/utils'

import { useAuctionsLoans } from '../../hooks'
import { MAX_APY_INCREASE_PERCENT } from './constants'
import { calcWeeklyInterestFee } from './helpers'

import styles from './RefinanceTable.module.less'

interface SummaryProps {
  loans: Loan[]
  selectedLoans: Loan[]
  onSelectLoans: (loans: Loan[]) => void
  onDeselectAllLoans: () => void
}

export const Summary: FC<SummaryProps> = ({
  loans,
  selectedLoans,
  onSelectLoans,
  onDeselectAllLoans,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { addMints } = useAuctionsLoans()
  const { toggleVisibility } = useWalletModal()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const totalDebt = sumBy(selectedLoans, (loan) => calculateLoanRepayValue(loan))
  const totalLoanValue = map(selectedLoans, (loan) => loan.fraktBond.borrowedAmount)
  const totalWeeklyInterest = sumBy(selectedLoans, (loan) => calcWeeklyInterestFee(loan))

  const totalApr = map(selectedLoans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const weightedApr = calcWeightedAverage(totalApr, totalLoanValue)
  const cappedWeightedApr = Math.min(weightedApr, MAX_APY_INCREASE_PERCENT)

  const onSuccess = (loansAmount: number) => {
    if (!getDialectAccessToken(wallet.publicKey?.toBase58())) {
      open(SubscribeNotificationsModal, {
        title: createRefinanceSubscribeNotificationsTitle(loansAmount),
        message: createRefinanceSubscribeNotificationsContent(),
        onActionClick: () => {
          close()
          setBanxNotificationsSiderVisibility(true)
        },
        onCancel: close,
      })
    }
  }

  const refinanceAll = () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = selectedLoans.map((loan) => ({ loan }))

    new TxnExecutor(
      makeRefinanceAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_OPTIONS },
    )
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results
        const failedTransactionsCount = failed.length

        destroySnackbar(loadingSnackbarId)

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Loans successfully refinanced', type: 'success' })

          const mintsToHidden = chain(confirmed)
            .map(({ result }) => result?.nft.mint)
            .compact()
            .value()

          addMints(...mintsToHidden)
          onDeselectAllLoans()
          onSuccess(mintsToHidden.length)
        }

        if (failedTransactionsCount) {
          return enqueueTranactionsError(failedTransactionsCount)
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Refinance',
        })
      })
      .execute()
  }

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (wallet.connected) {
      trackPageEvent('refinance', `refinance-bottom`)
      refinanceAll()
    } else {
      toggleVisibility()
    }
    event.stopPropagation()
  }

  const handleLoanSelection = (value = 0) => {
    onSelectLoans(loans.slice(0, value))
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{selectedLoans.length}</p>
        <p>Loans selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total to lend" value={totalDebt} divider={1e9} />
        <StatInfo label="Weekly interest" value={totalWeeklyInterest} divider={1e9} />
        <StatInfo label="Weighted apr" value={cappedWeightedApr} valueType={VALUES_TYPES.PERCENT} />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          value={selectedLoans.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
          className={styles.sliderContainer}
        />
        <Button onClick={onClickHandler} disabled={!selectedLoans.length}>
          Refinance {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
