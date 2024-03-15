import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, isEmpty } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useMarketOffers } from '@banx/pages/LendPage'
import { calculateClaimValue, useLenderLoans } from '@banx/pages/OffersPage'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeInstantRefinanceAction, makeTerminateAction } from '@banx/transactions/loans'
import {
  calculateLoanRepayValue,
  enqueueSnackbar,
  filterOutWalletLoans,
  findSuitableOffer,
  formatDecimal,
  isLoanActiveOrRefinanced,
  isLoanTerminating,
  usePriorityFees,
} from '@banx/utils'

import { useSelectedLoans } from '../../loansState'

import styles from './ActionsCell.module.less'

interface ManageModalProps {
  loan: Loan
}

export const ManageModal: FC<ManageModalProps> = ({ loan }) => {
  const { close } = useModal()

  //? Uncomment when repayment call ready
  // const modalTabs: Tab[] = [
  //   {
  //     label: 'Repayment call',
  //     value: 'repayment',
  //     disabled: true, //TODO enable when repayment call implemented
  //   },
  //   {
  //     label: 'Closure',
  //     value: 'closure',
  //     // disabled: !onTerminate && !onInstant,
  //   },
  // ]
  // const defaultTabValue = modalTabs[1].value
  // const {
  //   tabs,
  //   value: tabValue,
  //   setValue: setTabValue,
  // } = useTabs({
  //   tabs: modalTabs,
  //   defaultValue: defaultTabValue,
  // })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      {/* //? Uncomment when repayment call ready */}
      {/* <Tabs className={styles.tabs} tabs={tabs} value={tabValue} setValue={setTabValue} />
      {tabValue === modalTabs[0].value && <RepaymentCallContent loan={loan} close={close} />}
      {tabValue === modalTabs[1].value && <ClosureContent loan={loan} />} */}
      <ClosureContent loan={loan} />
    </Modal>
  )
}

interface ClosureContentProps {
  loan: Loan
}
const ClosureContent: FC<ClosureContentProps> = ({ loan }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { close } = useModal()

  const priorityFees = usePriorityFees()

  const { remove: removeLoan } = useSelectedLoans()

  const { updateOrAddLoan /* addMints: hideLoans */ } = useLenderLoans()

  const { offers, /* updateOrAddOffer */ isLoading } = useMarketOffers({
    marketPubkey: loan.fraktBond.hadoMarket,
  })

  const bestOffer = useMemo(() => {
    return chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({
          offers,
          walletPubkey: wallet?.publicKey?.toBase58(),
        }),
      )
      .thru((offers) =>
        findSuitableOffer({
          loanValue: calculateLoanRepayValue(loan),
          offers,
        }),
      )
      .value()
  }, [offers, loan, wallet])

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const hasRefinanceOffer = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffer && loanActiveOrRefinanced
  const canTerminate = !isLoanTerminating(loan) && loanActiveOrRefinanced

  const totalClaimValue = calculateClaimValue(loan)
  const formattedClaimValue = `+${formatDecimal(totalClaimValue / 1e9)}◎`

  const terminateLoan = () => {
    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        updateOrAddLoan({ ...loan, ...result })
        enqueueSnackbar({
          message: 'Offer termination successfully initialized',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })

        removeLoan(loan.publicKey, wallet?.publicKey?.toBase58() || '')
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const instantLoan = () => {
    if (!bestOffer) return

    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParam({ loan, bestOffer, priorityFees })
      // .on('pfSuccessEach', (results) => {
      //   const { result, txnHash } = results[0]
      //   result?.bondOffer && updateOrAddOffer(result.bondOffer)
      //   hideLoans(loan.nft.mint)
      //   enqueueSnackbar({
      //     message: 'Offer successfully sold',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${txnHash}`,
      //   })
      // })
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RefinanceInstant',
        })
      })
      .execute()
  }

  return (
    <div className={styles.closureContent}>
      <div
        className={classNames(styles.modalContent, styles.twoColumnsContent, styles.closureTexts)}
      >
        <h3>Exit</h3>
        <h3>Terminate</h3>
        <p>Instantly receive your total claim</p>
        <p>
          Send your loan to refinancing auction to seek new lenders. If successful, you will receive
          SOL in your wallet. If unsuccessful after 72 hours you will receive the collateral instead
        </p>
      </div>

      <div className={styles.modalContent}>
        {isLoading && <Loader />}
        {!isLoading && (
          <div className={styles.twoColumnsContent}>
            <Button onClick={instantLoan} disabled={!canRefinance} variant="secondary">
              {canRefinance ? `Exit ${formattedClaimValue}` : 'No suitable offers yet'}
            </Button>
            <Button
              className={styles.terminateButton}
              onClick={terminateLoan}
              disabled={!canTerminate}
              variant="secondary"
            >
              Terminate
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

//? Uncomment when repayment call ready
// interface RepaymentCallContentProps {
//   loan: Loan
//   close: () => void
// }
// const RepaymentCallContent: FC<RepaymentCallContentProps> = ({ loan, close }) => {
//   const DEFAULT_PERCENT_VALUE = 25

//   const totalClaim = calculateLoanRepayValue(loan)
//   const initialRepayValue = totalClaim * (DEFAULT_PERCENT_VALUE / 100)

//   const [partialPercent, setPartialPercent] = useState<number>(DEFAULT_PERCENT_VALUE)
//   const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

//   const onPartialPercentChange = (percentValue: number) => {
//     setPartialPercent(percentValue)
//     setPaybackValue((totalClaim * percentValue) / 100)
//   }

//   const remainingDebt = totalClaim - paybackValue

//   const ltv = (remainingDebt / loan.nft.collectionFloor) * 100
//   const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

//   const onSend = () => {
//     try {
//       //TODO send repayment call logic here
//       trackPageEvent('myoffers', 'activetab-repaymentcall')
//     } finally {
//       close()
//     }
//   }

//   return (
//     <div className={styles.modalContent}>
//       <StatInfo
//         flexType="row"
//         label="Total claim:"
//         value={totalClaim}
//         divider={1e9}
//         classNamesProps={{ container: styles.repaymentCallInfo }}
//       />
//       <Slider value={partialPercent} onChange={onPartialPercentChange} />
//       <div className={styles.repaimentCallAdditionalInfo}>
//         <StatInfo flexType="row" label="Repay value" value={paybackValue} divider={1e9} />
//         <StatInfo flexType="row" label="Remaining debt" value={remainingDebt} divider={1e9} />
//         <StatInfo
//           flexType="row"
//           label="New LTV"
//           value={ltv}
//           valueStyles={{ color: colorLTV }}
//           valueType={VALUES_TYPES.PERCENT}
//         />
//       </div>
//       <Button className={styles.repaymentCallButton} onClick={onSend} disabled={!partialPercent}>
//         Send
//       </Button>
//     </div>
//   )
// }
