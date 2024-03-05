import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'

import { Loan } from '@banx/api/core'
import { useHiddenNftsMints } from '@banx/pages/OffersPage'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction } from '@banx/transactions/loans'
import { enqueueSnackbar, isLoanLiquidated, isLoanTerminating, trackPageEvent } from '@banx/utils'

import { ManageModal } from './ManageModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView?: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView = false }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { open } = useModal()

  const { addMints: hideLoans } = useHiddenNftsMints()

  const onClaim = () => {
    trackPageEvent('myoffers', 'activetab-claim')
    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEach', (results) => {
        hideLoans(loan.nft.mint)
        enqueueSnackbar({
          message: 'Collateral successfully claimed',
          type: 'success',
          solanaExplorerPath: `tx/${results[0].txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
        })
      })
      .execute()
  }

  const buttonSize = isCardView ? 'default' : 'small'

  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  const canClaim = isLoanExpired && isTerminatingStatus

  const showModal = () => {
    open(ManageModal, {
      loan,
    })
  }

  return (
    <div className={styles.actionsButtons}>
      {canClaim && (
        <Button className={styles.actionButton} onClick={onClaim} size={buttonSize}>
          Claim NFT
        </Button>
      )}
      {!canClaim && (
        <Button
          className={styles.actionButton}
          onClick={(event) => {
            showModal()
            event.stopPropagation()
          }}
          disabled={isTerminatingStatus}
          variant="secondary"
          size={buttonSize}
        >
          Manage
        </Button>
      )}
      <Button
        className={classNames(styles.tensorButtonLink, { [styles.cardView]: isCardView })}
        variant="secondary"
        type="circle"
        size="small"
      >
        <TensorLink mint={loan.nft.mint} />
      </Button>
    </div>
  )
}
