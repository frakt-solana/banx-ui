import { FC, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useWalletLoansAndOffers } from '@banx/pages/LoansPage/hooks'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useLoansOptimistic, useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeBorrowRefinanceAction } from '@banx/transactions/loans'
import { calculateLoanRepayValue, enqueueSnackbar } from '@banx/utils'

import { useLoansTransactions } from '../hooks'

import styles from '../LoansActiveTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
  disableActions: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView, disableActions }) => {
  const { fraktBond } = loan

  const { open } = useModal()
  const wallet = useWallet()
  const { connection } = useConnection()

  const openModal = () => {
    open(RepayModal, { loan })
  }

  const { offers, updateOptimisticOffers } = useWalletLoansAndOffers()
  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clearSelection } = useSelectedLoans()

  const isLoanTerminating =
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualManualTerminating

  const offerToRefinance = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket || '']
    return chain(offersByMarket)
      .sortBy(offersByMarket, 'fundsSolOrTokenBalance')
      .reverse()
      .value()
      .at(0)
  }, [offers, fraktBond])

  const refinance = () => {
    if (!offerToRefinance) return
    new TxnExecutor(makeBorrowRefinanceAction, { connection, wallet })
      .addTxnParam({
        loan,
        offer: offerToRefinance,
      })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.offer && updateOptimisticOffers([result.offer])
        if (result?.loan) {
          updateLoansOptimistic([result.loan], wallet.publicKey?.toBase58() || '')
        }
        clearSelection()
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RefinanceBorrow',
        })
      })
      .execute()
  }

  return (
    <div className={styles.actionsButtons}>
      <Button
        className={styles.refinanceBtn}
        size={isCardView ? 'large' : 'small'}
        variant="secondary"
        disabled={disableActions || !offerToRefinance}
        onClick={(event) => {
          refinance()
          event.stopPropagation()
        }}
      >
        {isLoanTerminating ? 'Extend' : 'Reborrow'}
      </Button>
      <Button
        size={isCardView ? 'large' : 'small'}
        disabled={disableActions}
        onClick={(event) => {
          openModal()
          event.stopPropagation()
        }}
      >
        Repay
      </Button>
    </div>
  )
}

interface RepayModalProps {
  loan: Loan
}

const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { close } = useModal()

  const { repayLoan, repayPartialLoan } = useLoansTransactions()

  const initialRepayValue = calculateLoanRepayValue(loan)

  const [partialPercent, setPartialPercent] = useState<number>(100)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setPaybackValue((initialRepayValue * percentValue) / 100)
  }

  const remainingValue = initialRepayValue - paybackValue

  const onSubmit = async () => {
    try {
      if (partialPercent === 100) {
        await repayLoan(loan)
      } else {
        await repayPartialLoan(loan, partialPercent * 100)
      }
    } catch (error) {
      console.error(error)
    } finally {
      close()
    }
  }

  return (
    <Modal open onCancel={close}>
      <StatInfo
        flexType="row"
        label="Debt:"
        value={initialRepayValue}
        divider={1e9}
        classNamesProps={{ container: styles.mainRepayInfo }}
      />
      <Slider value={partialPercent} onChange={onPartialPercentChange} />
      <div className={styles.additionalRepayInfo}>
        <StatInfo flexType="row" label="Repay value" value={paybackValue} divider={1e9} />
        <StatInfo flexType="row" label="Remaining debt" value={remainingValue} divider={1e9} />
      </div>
      <Button className={styles.repayButton} onClick={onSubmit} disabled={!partialPercent}>
        Repay {createSolValueJSX(paybackValue, 1e9, '0◎')}
      </Button>
    </Modal>
  )
}
