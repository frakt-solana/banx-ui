import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { Theme, useTheme } from '@banx/hooks'
import { InfinityIcon, BorrowFilled, LendFilled, Lightning, PencilLtv } from '@banx/icons'
import { PATHS } from '@banx/router'

import { useAllTotalStats } from '../DashboardPage/hooks'
import { Interest } from './icons'

import styles from './RootPage.module.less'

export const RootPage = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === Theme.DARK

  return (
    <div className={classNames(styles.pageWrapper, { [styles.pageWrapperDark]: isDarkTheme })}>
      <div className={styles.rootContent}>
        <div className={styles.mainContent}>
          <Header />
          <Content />
        </div>
        <GeneralStats />
      </div>
    </div>
  )
}

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1>
          Loans <span>done right</span>
        </h1>
        <h2>Lend and Borrow against any asset</h2>
        <AdvantagesSection />
      </div>
    </div>
  )
}

const AdvantagesSection = () => {
  return (
    <div className={styles.advantages}>
      <div className={styles.advantage}>
        <Interest />
        <p>
          Flexible
          <br />
          lending
        </p>
      </div>
      <div className={styles.advantage}>
        <Lightning />
        <p>
          Lightning fast
          <br />
          experience
        </p>
      </div>
      <div className={styles.advantage}>
        <InfinityIcon />
        <p>
          Perpetual
          <br />
          loans
        </p>
      </div>
      <div className={styles.advantage}>
        <PencilLtv />
        <p>
          Custom
          <br />
          risk
        </p>
      </div>
    </div>
  )
}

const Content = () => (
  <div className={styles.content}>
    <div className={styles.listCol}>
      <h4>
        <BorrowFilled />
        Borrowing
      </h4>
      <ul>
        <li>Borrow SOL or USDC against your NFTs or tokens</li>
        <li>Loans have no fixed duration: repay when you want, in full or in part</li>
        <li>Enjoy pro-rata interest and a 72H guaranteed extension on repayment calls</li>
      </ul>
      <NavLink to={PATHS.BORROW} className={styles.button}>
        <Button>Borrow</Button>
      </NavLink>
    </div>

    <div className={styles.separateLine} />

    <div className={styles.listCol}>
      <h4>
        <LendFilled />
        Lending
      </h4>
      <ul>
        <li>Earn yield on your SOL or USDC by providing loans against NFTs or tokens</li>
        <li>Set offers or instantly refinance active loans within your personal risk tolerance</li>
        <li>Terminate or sell your loans to exit anytime you want</li>
      </ul>
      <NavLink to={PATHS.LEND} className={styles.button}>
        <Button>Lend</Button>
      </NavLink>
    </div>
  </div>
)

const GeneralStats = () => {
  const { data } = useAllTotalStats()

  const { activeLoans = 0, totalValueLocked = 0, loansVolumeAllTime = 0 } = data || {}

  const statClassNamesProps = {
    container: styles.generalStat,
    label: styles.generalStatLabel,
    value: styles.generalStatValue,
  }

  return (
    <div className={styles.generalStats}>
      <StatInfo
        label="Offers value locked"
        value={<DisplayValue value={activeLoans} />}
        classNamesProps={statClassNamesProps}
      />
      <StatInfo
        label="Total value locked"
        value={<DisplayValue value={totalValueLocked} />}
        classNamesProps={statClassNamesProps}
      />

      <StatInfo
        label="Loans volume all time"
        value={<DisplayValue value={loansVolumeAllTime} />}
        classNamesProps={statClassNamesProps}
      />
    </div>
  )
}
