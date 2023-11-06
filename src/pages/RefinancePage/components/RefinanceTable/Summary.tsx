import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { map, sumBy } from 'lodash'
import moment from 'moment'

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
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRefinanceAction } from '@banx/transactions/loans'
import {
  HealthColorDecreasing,
  calcWeightedAverage,
  calculateLoanRepayValue,
  convertAprToApy,
  enqueueSnackbar,
  getColorByPercent,
  getDialectAccessToken,
  trackPageEvent,
} from '@banx/utils'

import { useAuctionsLoans } from '../../hooks'
import { calcWeeklyInterestFee } from './columns'

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

  const totalApy = map(selectedLoans, (loan) => {
    const { refinanceAuctionStartedAt } = loan.fraktBond
    const { amountOfBonds } = loan.bondTradeTransaction

    const currentTime = moment()
    const auctionStartTime = moment.unix(refinanceAuctionStartedAt)
    const hoursSinceStart = currentTime.diff(auctionStartTime, 'hours')

    const updatedAPR = amountOfBonds / 1e2 + hoursSinceStart
    return updatedAPR
  })

  const weightedApr = calcWeightedAverage(totalApy, totalLoanValue)
  const colorApr = getColorByPercent(weightedApr, HealthColorDecreasing)

  const refinanceAll = () => {
    const txnParams = selectedLoans.map((loan) => ({ loan }))

    const onSuccess = () => {
      if (!getDialectAccessToken(wallet.publicKey?.toBase58())) {
        open(SubscribeNotificationsModal, {
          title: createRefinanceSubscribeNotificationsTitle(selectedLoans.length),
          message: createRefinanceSubscribeNotificationsContent(),
          onActionClick: () => {
            close()
            setBanxNotificationsSiderVisibility(true)
          },
          onCancel: close,
        })
      }
    }

    new TxnExecutor(makeRefinanceAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]

        enqueueSnackbar({
          message: 'Loan successfully refinanced',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        onDeselectAllLoans()
        addMints(...selectedLoans.map(({ nft }) => nft.mint))
        onSuccess()
      })
      .on('pfError', (error) => {
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
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{selectedLoans.length}</p>
        <p className={styles.collateralsSubtitle}>Loans selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total to lend" value={totalDebt} divider={1e9} />
        <StatInfo label="Weekly interest" value={totalWeeklyInterest} />
        <StatInfo
          label="Weighted apy"
          value={convertAprToApy(weightedApr / 1e2)}
          valueStyles={{ color: weightedApr ? colorApr : '' }}
          classNamesProps={{ value: styles.aprValue }}
          valueType={VALUES_TYPES.PERCENT}
        />
      </div>
      <div className={styles.summaryBtns}>
        <CounterSlider
          value={selectedLoans.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
        />
        <Button onClick={onClickHandler} disabled={!selectedLoans.length}>
          Refinance {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
