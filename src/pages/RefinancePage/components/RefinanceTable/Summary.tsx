import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { map, sumBy } from 'lodash'
import moment from 'moment'

import { Button } from '@banx/components/Buttons'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRefinanceAction } from '@banx/transactions/loans'
import {
  calcWeightedAverage,
  calculateLoanRepayValue,
  convertAprToApy,
  enqueueSnackbar,
} from '@banx/utils'

import { useAuctionsLoans } from '../../hooks'

import styles from './RefinanceTable.module.less'

interface SummaryProps {
  selectedLoans: Loan[]
  onSelectAllLoans: () => void
  onDeselectAllLoans: () => void
}

export const Summary: FC<SummaryProps> = ({
  selectedLoans,
  onSelectAllLoans,
  onDeselectAllLoans,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { addMints } = useAuctionsLoans()
  const { toggleVisibility } = useWalletModal()

  const selectAllBtnText = !selectedLoans.length ? 'Select all' : 'Deselect all'
  const selectMobileBtnText = !selectedLoans.length
    ? `Select all`
    : `Deselect ${selectedLoans.length}`

  const totalFloor = sumBy(selectedLoans, ({ nft }) => nft.collectionFloor)
  const totalDebt = sumBy(selectedLoans, (loan) => calculateLoanRepayValue(loan))
  const totalLoanValue = map(selectedLoans, (loan) => loan.fraktBond.borrowedAmount)

  const totalApy = map(selectedLoans, (loan) => {
    const { refinanceAuctionStartedAt } = loan.fraktBond
    const { amountOfBonds } = loan.bondTradeTransaction

    const currentTime = moment()
    const auctionStartTime = moment.unix(refinanceAuctionStartedAt)
    const hoursSinceStart = currentTime.diff(auctionStartTime, 'hours')

    const updatedAPR = amountOfBonds / 1e4 + hoursSinceStart

    return convertAprToApy(updatedAPR)
  })

  const weightedApy = calcWeightedAverage(totalApy, totalLoanValue)

  const refinanceAll = () => {
    const txnParams = selectedLoans.map((loan) => ({ loan }))

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

  const onSelectAllBtnClick = () => {
    !selectedLoans.length ? onSelectAllLoans() : onDeselectAllLoans()
  }

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (wallet.connected) {
      refinanceAll()
    } else {
      toggleVisibility()
    }
    event.stopPropagation()
  }

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{selectedLoans.length}</p>
        <p className={styles.collateralsSubtitle}>Loans selected</p>
      </div>
      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <p>Total floor</p>
          <p>{createSolValueJSX(totalFloor, 1e9, '0◎')}</p>
        </div>
        <div className={styles.stats}>
          <p>Total debt</p>
          <p>{createSolValueJSX(totalDebt, 1e9, '0◎')}</p>
        </div>
        <div className={styles.stats}>
          <p>Weighted apy</p>
          <p>{createPercentValueJSX(weightedApy)}</p>
        </div>
      </div>
      <div className={styles.summaryBtns}>
        <Button variant="secondary" onClick={onSelectAllBtnClick}>
          <span className={styles.selectButtonText}>{selectAllBtnText}</span>
          <span className={styles.selectButtonMobileText}>{selectMobileBtnText}</span>
        </Button>
        <Button onClick={onClickHandler} disabled={!selectedLoans.length}>
          Refinance {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
