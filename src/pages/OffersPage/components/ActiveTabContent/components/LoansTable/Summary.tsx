import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { SMALL_DESKTOP_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction, makeTerminateAction } from '@banx/transactions/loans'
import { calcLoanBorrowedAmount, enqueueSnackbar } from '@banx/utils'

import styles from './LoansTable.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  hideLoans: (...mints: string[]) => void
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
}

export const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  loansToTerminate,
  loansToClaim,
  hideLoans,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { width } = useWindowSize()
  const isSmallDesktop = width < SMALL_DESKTOP_WIDTH

  const totalClaimableFloor = useMemo(
    () => sumBy(loansToClaim, ({ nft }) => nft.collectionFloor),
    [loansToClaim],
  )

  const totalTerminateLent = useMemo(
    () => sumBy(loansToTerminate, (loan) => calcLoanBorrowedAmount(loan)),
    [loansToTerminate],
  )

  const terminateLoans = () => {
    const txnParams = loansToTerminate.map((loan) => ({ loan }))

    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          enqueueSnackbar({
            message: 'Collateral successfully terminated',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })

          if (result) {
            updateOrAddLoan(result)
          }
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const claimLoans = () => {
    const txnParams = loansToClaim.map((loan) => ({ loan }))

    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        enqueueSnackbar({
          message: 'Collateral successfully claimed',
          type: 'success',
          solanaExplorerPath: `tx/${results[0].txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        hideLoans(...loansToClaim.map(({ nft }) => nft.mint))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
        })
      })
      .execute()
  }

  return (
    <div className={styles.summaryContainer}>
      <ClaimNFTsButton
        onClick={claimLoans}
        totalLoans={loansToClaim.length}
        value={totalClaimableFloor}
        isSmallDesktop={isSmallDesktop}
      />

      <TerminateButton
        onClick={terminateLoans}
        totalLoans={loansToTerminate.length}
        value={totalTerminateLent}
        isSmallDesktop={isSmallDesktop}
      />
    </div>
  )
}

interface ButtonProps {
  onClick: () => void
  totalLoans?: number
  isSmallDesktop: boolean
  value: number
}

const ClaimNFTsButton: FC<ButtonProps> = (props) => {
  const { isSmallDesktop, totalLoans, onClick, value } = props
  const buttonText = isSmallDesktop ? 'Claim' : 'Claim all NFTs'
  const label = isSmallDesktop ? 'Claimable floor' : 'Collateral'

  return (
    <div className={styles.infoRow}>
      <div className={styles.loansContainer}>
        <p className={styles.loansValueText}>{totalLoans}</p>
        <div className={styles.loansInfoContainer}>
          <StatInfo
            label={label}
            value={value}
            classNamesProps={{ value: styles.value }}
            divider={1e9}
          />
        </div>
      </div>
      <Button
        className={styles.summaryButton}
        onClick={onClick}
        disabled={!totalLoans}
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  )
}

const TerminateButton: FC<ButtonProps> = (props) => {
  const { isSmallDesktop, totalLoans, onClick, value } = props
  const buttonText = isSmallDesktop ? 'Terminate' : 'Terminate all'
  const label = isSmallDesktop ? 'Underwater' : 'Underwater loans'

  return (
    <div className={styles.infoRow}>
      <div className={styles.loansContainer}>
        <p className={styles.loansValueText}>{totalLoans}</p>
        <div className={styles.loansInfoContainer}>
          <StatInfo
            label={label}
            value={value}
            classNamesProps={{ value: styles.value }}
            divider={1e9}
          />
        </div>
      </div>
      <Button
        className={classNames(styles.summaryButton, styles.terminateButton)}
        onClick={onClick}
        disabled={!totalLoans}
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  )
}
