import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'

import { Theme, useTheme } from '@banx/hooks'
import { InfinityIcon, Lightning, PencilLtv } from '@banx/icons'
import { PATHS } from '@banx/router'

import IndexImage from './assets/ContentGroup.png'
import { Interest } from './icons'

import styles from './RootPage.module.less'

export const RootPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Content />
      <ImageComponent />
    </div>
  )
}

const Header = () => {
  const { theme } = useTheme()
  const isDarkTheme = theme === Theme.DARK

  return (
    <div className={classNames(styles.header, { [styles.headerDark]: isDarkTheme })}>
      <div className={styles.headerContent}>
        <h1 className={styles.nftToken}>
          <div className={styles.nftTokenText}>nft & token</div>
          Loans
        </h1>
        <h1>done right</h1>
        <h2>Borrow and Lend with maximum capital efficiency</h2>
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
        <PencilLtv />
        <p>
          Custom
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

const Content = () => (
  <div className={styles.content}>
    <div className={styles.listCol}>
      <h3 className={styles.borrowTitle}>Borrowing</h3>
      <ul>
        <li>Borrow SOL or USDC against your NFTs or tokens</li>
        <li>Loans have no fixed duration: repay when you want, in full or in part</li>
        <li>Enjoy pro-rata interest and a 72H guaranteed extension on repayment calls</li>
      </ul>
      <NavLink to={PATHS.BORROW} className={styles.button}>
        <Button>Borrow</Button>
      </NavLink>
    </div>

    <div className={styles.listCol}>
      <h3 className={styles.lendTitle}>Lending</h3>
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

const ImageComponent = () => <img src={IndexImage} className={styles.indexImg} alt="Index" />
