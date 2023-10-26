import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeClaimAction, makeTerminateAction } from '@banx/transactions/loans'
import { enqueueSnackbar } from '@banx/utils'

import styles from './ActiveOffersTable.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  addMints: (...mints: string[]) => void
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
}

export const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  loansToTerminate,
  loansToClaim,
  addMints,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const totalClaimableFloor = useMemo(() => {
    return sumBy(loansToClaim, ({ nft }) => nft.collectionFloor)
  }, [loansToClaim])

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
    <div className={styles.summary}>
      <div className={styles.totalLoans}>
        <p className={styles.totalLoansValue}>{loansToClaim.length}</p>
        <div className={styles.totalLoansInfo}>
          <p>Collaterals</p>
          <p>to claim</p>
        </div>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total claimable floor" value={totalClaimableFloor} divider={1e9} />
      </div>
      <div className={styles.summaryBtns}>
        <Button onClick={terminateLoans} disabled={!loansToTerminate.length}>
          Terminate loans
        </Button>
        <Button onClick={claimLoans} disabled={!loansToClaim.length}>
          Claim all NFTs
        </Button>
      </div>
    </div>
  )
}
