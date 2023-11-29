import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { SMALL_DESKTOP_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction, makeTerminateAction } from '@banx/transactions/loans'
import { calcLoanBorrowedAmount, enqueueSnackbar } from '@banx/utils'

import { ClaimInterestButton, ClaimNFTsButton, TerminateButton } from './components'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  addMints: (...mints: string[]) => void
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
}

const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  loansToTerminate,
  loansToClaim,
  addMints,
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
        addMints(...loansToClaim.map(({ nft }) => nft.mint))
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
      <ClaimInterestButton
        onClick={claimLoans}
        totalLoans={loansToClaim.length}
        isSmallDesktop={isSmallDesktop}
        value={10}
      />

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

export default Summary
