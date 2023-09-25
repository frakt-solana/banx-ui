import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map } from 'lodash'
import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'

import { PATHS } from '@banx/router'

import { ChartStatInfo, DashboardStatInfo, Heading } from '../components'
import { LOANS_COLOR_MAP, LOANS_DISPLAY_NAMES, LoansStatus } from './constants'

import styles from './DashboardBorrowTab.module.less'

interface AvailableToBorrowProps {
  totalMarkets: number
  totalLiquidity: number
  userNFTs: number
}

export const AvailableToBorrow: FC<AvailableToBorrowProps> = ({
  totalMarkets,
  totalLiquidity,
  userNFTs,
}) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const headingText = connected ? 'Borrow in bulk' : 'Available to borrow'
  const buttonText = connected ? 'Borrow $SOL in bulk' : 'Connect wallet to borrow $SOL'

  return (
    <div className={styles.availableToBorrow}>
      <Heading title={headingText} />

      <div className={styles.stats}>
        {connected ? (
          <>
            <DashboardStatInfo label="Borrow up to" value={124} />
            <DashboardStatInfo
              label="From your"
              value={`${userNFTs} NFTS`}
              valueType={VALUES_TYPES.STRING}
            />
          </>
        ) : (
          <>
            <DashboardStatInfo
              label="Collections whitelisted"
              value={totalMarkets}
              valueType={VALUES_TYPES.STRING}
            />
            <DashboardStatInfo
              label="Total liquidity"
              value={totalLiquidity}
              decimalPlaces={0}
              divider={1e9}
            />
          </>
        )}
      </div>

      {connected ? (
        <NavLink className={styles.button} to={PATHS.BORROW}>
          <Button className={styles.button}>{buttonText}</Button>
        </NavLink>
      ) : (
        <Button onClick={toggleVisibility} className={styles.button}>
          {buttonText}
        </Button>
      )}
    </div>
  )
}

//? MOCK DATA
const activeLoans = 10
const terminatingLoans = 10
const liquidationLoans = 10
const totalLoans = activeLoans + terminatingLoans + liquidationLoans
const totalBorrowed = 15.5
const totalDebt = 130

export const MyLoans = () => {
  const navigate = useNavigate()

  const loansStatusValueMap = {
    [LoansStatus.Active]: activeLoans,
    [LoansStatus.Terminating]: terminatingLoans,
    [LoansStatus.Liquidation]: liquidationLoans,
  }

  const loansData = Object.entries(loansStatusValueMap).map(([status, value]) => ({
    name: LOANS_DISPLAY_NAMES[status as LoansStatus],
    key: status,
    value,
  }))

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  return (
    <div className={styles.loansContainer}>
      <h4 className={styles.loansHeading}>My loans</h4>
      <div className={styles.loansContent}>
        <div className={styles.loansStatsContainer}>
          <div className={styles.loansStats}>
            <DashboardStatInfo label="Total borrowed" value={totalBorrowed} />
            <DashboardStatInfo label="Total debt" value={totalDebt} />
          </div>
          <div className={styles.loansChartStats}>
            {loansData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={createSolValueJSX(value)}
                indicatorColor={LOANS_COLOR_MAP[key as LoansStatus]}
              />
            ))}
          </div>
        </div>
        <Doughnut
          className={styles.doughnutChart}
          data={map(loansData, 'value')}
          colors={Object.values(LOANS_COLOR_MAP)}
          statInfoProps={{ label: 'Total loans', value: totalLoans }}
        />
      </div>
      <Button onClick={goToLoansPage} className={styles.manageLoansButton}>
        Manage my loans
      </Button>
    </div>
  )
}
