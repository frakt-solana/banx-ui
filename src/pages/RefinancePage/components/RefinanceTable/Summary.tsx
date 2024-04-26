import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, map, sumBy, uniqueId } from 'lodash'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Loan } from '@banx/api/core'
import { useIsLedger, useModal } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createRefinanceTxnData } from '@banx/transactions/loans'
import {
  calcWeightedAverage,
  calculateLoanRepayValue,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getDialectAccessToken,
  trackPageEvent,
} from '@banx/utils'

import { TxnExecutor } from '../../../../../../solana-txn-executor/src'
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
  const { isLedger } = useIsLedger()
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

  const refinanceAll = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedLoans.map((loan) => createRefinanceTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<Loan>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 1 : 40,
      })
        .addTransactionParams(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

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

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selectedLoans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Refinance',
      })
    }
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
        <StatInfo label="Total to lend" value={<DisplayValue value={totalDebt} />} />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyInterest} />} />
        <StatInfo label="Weighted apr" value={cappedWeightedApr} valueType={VALUES_TYPES.PERCENT} />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          value={selectedLoans.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
          className={styles.sliderContainer}
        />
        <Button
          className={styles.refinanceButton}
          onClick={onClickHandler}
          disabled={!selectedLoans.length}
        >
          Refinance <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}
