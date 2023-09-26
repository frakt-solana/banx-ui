import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map } from 'lodash'
import { NavLink, useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { Doughnut } from '@banx/components/Charts'
import { VALUES_TYPES } from '@banx/components/StatInfo'
import { useWalletModal } from '@banx/components/WalletModal'

import { TotalBorrowerStats } from '@banx/api/stats'
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

interface MyLoansProps {
  stats: TotalBorrowerStats
}
export const MyLoans: FC<MyLoansProps> = ({ stats }) => {
  const navigate = useNavigate()
  const { activeLoans, terminatingLoans, liquidationLoans, totalBorrowed, totalDebt } = stats

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
            <DashboardStatInfo label="Total borrowed" value={totalBorrowed} divider={1e9} />
            <DashboardStatInfo label="Total debt" value={totalDebt} divider={1e9} />
          </div>
          <div className={styles.loansChartStats}>
            {loansData.map(({ key, name, value }) => (
              <ChartStatInfo
                key={key}
                label={name}
                value={value}
                indicatorColor={LOANS_COLOR_MAP[key as LoansStatus]}
              />
            ))}
          </div>
        </div>
        <Doughnut
          className={styles.doughnutChart}
          data={map(loansData, 'value')}
          colors={Object.values(LOANS_COLOR_MAP)}
          statInfoProps={{ label: 'Total loans', value: liquidationLoans }}
        />
      </div>
      <Button onClick={goToLoansPage} className={styles.manageLoansButton}>
        Manage my loans
      </Button>
    </div>
  )
}
