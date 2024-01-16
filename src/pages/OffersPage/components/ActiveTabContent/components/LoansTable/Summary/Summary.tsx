import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction } from '@banx/transactions/loans'
import { enqueueSnackbar } from '@banx/utils'

import { TerminateContent } from './components'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  hideLoans: (...mints: string[]) => void
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
  isUnderwaterFilterActive: boolean

  selectedLoans: Loan[]
  setSelection: (loans: Loan[]) => void
}

export const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  loansToTerminate,
  loansToClaim,
  hideLoans,
  isUnderwaterFilterActive,

  selectedLoans,
  setSelection,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { width } = useWindowSize()
  const isSmallDesktop = width < TABLET_WIDTH

  const totalClaimableFloor = useMemo(
    () => sumBy(loansToClaim, ({ nft }) => nft.collectionFloor),
    [loansToClaim],
  )

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
      {isUnderwaterFilterActive ? (
        <TerminateContent
          loans={loansToTerminate}
          selectedLoans={selectedLoans}
          setSelection={setSelection}
          updateOrAddLoan={updateOrAddLoan}
        />
      ) : (
        <ClaimNFTsButton
          onClick={claimLoans}
          totalLoans={loansToClaim.length}
          value={totalClaimableFloor}
          isSmallDesktop={isSmallDesktop}
        />
      )}
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
