import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
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
  const { width } = useWindowSize()
  const isMobile = width < TABLET_WIDTH

  const totalClaimableFloor = useMemo(() => {
    return sumBy(loansToClaim, ({ nft }) => nft.collectionFloor)
  }, [loansToClaim])

  const totalTerminateLent = useMemo(() => {
    return sumBy(loansToTerminate, ({ fraktBond, bondTradeTransaction }) => bondTradeTransaction.solAmount + bondTradeTransaction.feeAmount)
  }, [loansToTerminate])

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
      <div className={styles.infoRow}>
        <div className={styles.loansContainer}>
          <p className={styles.loansValueText}>{loansToClaim.length}</p>
          <div className={styles.loansInfoContainer}>
            <StatInfo
              label={isMobile ? 'Total Claimable floor' : 'Claimable Nfts'}
              value={totalClaimableFloor}
              classNamesProps={{ value: styles.value }}
              divider={1e9}
            />
          </div>
        </div>
        <Button className={styles.claimButton} onClick={claimLoans} disabled={!loansToClaim.length}>
          {isMobile ? `Claim ${loansToClaim?.length} nfts` : 'Claim all'}
        </Button>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.loansContainer}>
          <p className={styles.loansValueText}>{loansToTerminate.length}</p>
          <div className={styles.loansInfoContainer}>
            <StatInfo
              label={isMobile ? 'Underwater loans value' : 'Underwater loans'}
              value={totalTerminateLent}
              classNamesProps={{ value: styles.value }}
              divider={1e9}
            />
          </div>
        </div>
        <Button
          className={styles.terminateButton}
          onClick={terminateLoans}
          disabled={!loansToTerminate.length}
          variant="secondary"
        >
          {isMobile ? `Terminate ${loansToTerminate?.length} loans` : 'Terminate all'}
        </Button>
      </div>
    </div>
  )
}
