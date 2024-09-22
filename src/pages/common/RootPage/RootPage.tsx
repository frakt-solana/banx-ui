import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { createDisplayValueJSX } from '@banx/components/TableComponents'

import { Theme, useTheme } from '@banx/hooks'
import { InfinityIcon, BorrowFilled, LendFilled, Lightning, PencilLtv } from '@banx/icons'
import { PATHS } from '@banx/router'
import { buildUrlWithMode, buildUrlWithModeAndToken } from '@banx/store'
import { useAssetMode } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { formatValueByTokenType } from '@banx/utils'

import { useAllUsdcTotalStats } from './hooks'
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
      <div
        className={classNames(styles.footerBg, {
          [styles.footerBgDark]: isDarkTheme,
        })}
      />
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
          rates
        </p>
      </div>
      <div className={styles.advantage}>
        <Lightning />
        <p>
          Lightning
          <br />
          fast
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

const Content = () => {
  const { currentAssetMode } = useAssetMode()
  const { tokenType } = useNftTokenType()
  const navigate = useNavigate()

  const goToPage = (path: string) => {
    const newPath = buildUrlWithMode(path, currentAssetMode)
    navigate(buildUrlWithModeAndToken(newPath, currentAssetMode, tokenType))
  }

  return (
    <div className={styles.content}>
      <div className={styles.listCol}>
        <h4>
          <BorrowFilled />
          Borrowing
        </h4>
        <ul>
          <li>Borrow SOL or USDC against any asset</li>
          <li>Loans have no fixed duration: repay when you want, in full or in part</li>
          <li>Enjoy pro-rata interest and a 72H guaranteed extension on repayment calls</li>
        </ul>
        <Button onClick={() => goToPage(PATHS.BORROW)} className={styles.button}>
          Borrow
        </Button>
      </div>

      <div className={styles.separateLine} />

      <div className={styles.listCol}>
        <h4>
          <LendFilled />
          Lending
        </h4>
        <ul>
          <li>
            Earn high yield on your SOL or USDC through active lending and get returns while your
            funds are idle
          </li>
          <li>
            Set offers or instantly refinance active loans within your personal risk tolerance
          </li>
          <li>Terminate or sell your loans to exit anytime you want</li>
        </ul>
        <Button onClick={() => goToPage(PATHS.LEND)} className={styles.button}>
          Lend
        </Button>
      </div>
    </div>
  )
}

const GeneralStats = () => {
  const { data } = useAllUsdcTotalStats()

  const { activeLoans = 0, totalValueLocked = 0, loansVolumeAllTime = 0 } = data || {}

  const statClassNamesProps = {
    container: styles.generalStat,
    label: styles.generalStatLabel,
    value: styles.generalStatValue,
  }

  const usdcTokenType = LendingTokenType.Usdc

  const formattedTotalValueLocked = formatValueByTokenType(totalValueLocked, usdcTokenType) || '0'
  const formattedTotalLoansVolume = formatValueByTokenType(loansVolumeAllTime, usdcTokenType) || '0'

  return (
    <div className={styles.generalStats}>
      <StatInfo label="Active loans" value={activeLoans} classNamesProps={statClassNamesProps} />
      <StatInfo
        label="Total value locked"
        value={createDisplayValueJSX(formattedTotalValueLocked, '$')}
        classNamesProps={statClassNamesProps}
      />

      <StatInfo
        label="All time volume"
        value={createDisplayValueJSX(formattedTotalLoansVolume, '$')}
        classNamesProps={statClassNamesProps}
      />
    </div>
  )
}
