import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'

import { Theme, useTheme } from '@banx/hooks'
import { InfinityIcon, Lightning, Shield } from '@banx/icons'
import { PATHS } from '@banx/router'
import { useMixpanelLocationTrack } from '@banx/utils'

import { Borrow, Interest, Lend, Refinance } from './icons'

import styles from './RootPage.module.less'

export const RootPage = () => {
  useMixpanelLocationTrack('index')

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.content}>
        <AdvantagesSection />

        <ButtonsSection />

        <DescriptionsSection />
      </div>
    </div>
  )
}

const Header = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === Theme.DARK

  return (
    <div className={classNames(styles.header, { [styles.headerDark]: isDarkTheme })}>
      <h1>NFT Lending done right</h1>
      <h2>Borrow, Lend and Refinance with maximum capital efficiency</h2>
    </div>
  )
}

const AdvantagesSection = () => {
  return (
    <div className={styles.advantages}>
      <div className={styles.advantage}>
        <Interest />
        <p>
          Time-based
          <br />
          interest
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
        <Shield />
        <p>
          Low
          <br />
          risk
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
    </div>
  )
}

const ButtonsSection = () => (
  <div className={styles.buttons}>
    <NavLink to={PATHS.BORROW} className={styles.button}>
      <Button>Borrow</Button>
    </NavLink>

    <NavLink to={PATHS.LEND} className={styles.button}>
      <Button>Lend</Button>
    </NavLink>
  </div>
)

const DescriptionsSection = () => (
  <div className={styles.descriptions}>
    <div className={styles.description}>
      <h5>
        <Borrow /> Borrow
      </h5>
      <p>
        Borrow SOL against your NFT assets. Loans have no fixed duration, so you can repay any time.
        Interest accrues to the second, so you never pay more than you need to
      </p>
    </div>
    <div className={styles.descriptionsCol2}>
      <div className={styles.description}>
        <h5>
          <Lend /> Lend
        </h5>
        <p>
          Earn yield on your SOL by providing loans against NFTs. If you are unhappy, you can
          terminate loan or sell it to another lender any time
        </p>
      </div>
      <div className={styles.description}>
        <h5>
          <Refinance /> Refinance
        </h5>
        <p>You can instantly start earning yield by funding loans in the refinance auctions</p>
      </div>
    </div>
  </div>
)
