import borrowImg1 from './assets/borrow1.png'
import dashboardImg1 from './assets/dashboard1.png'
import dashboardImg2 from './assets/dashboard2.png'
import dashboardImg3 from './assets/dashboard3.png'
import lendImg1 from './assets/lend1.png'
import refinanceImg1 from './assets/refinance1.png'
import { OnboardingModalContentType } from './types'

import styles from './OnboardingModal.module.less'

const DASHBOARD_CONTENT = {
  title: 'What we are',
  slides: [
    {
      img: <img className={styles.slideImg} src={dashboardImg1} alt="dashboard 1" />,
      text: (
        <p className={styles.slideText}>
          Banx is a blazing fast{' '}
          <span className={styles.slideTextImportant}>P2P NFT lending protocol</span>, with lower
          loan-to-value ratios, lower liquidation risk, and the lowest interest rates.
        </p>
      ),
    },
    {
      img: <img className={styles.slideImg} src={dashboardImg2} alt="dashboard 2" />,
      text: (
        <p className={styles.slideText}>
          <span className={styles.slideTextImportant}>Loans are perpetual</span>: they last at least
          3 days and don&apos;t expire if you keep them healthy with small repayments.
        </p>
      ),
    },
    {
      img: <img className={styles.slideImg} src={dashboardImg3} alt="dashboard 3" />,
      text: (
        <p className={styles.slideText}>
          The $BANX token will hit the market in Q1&apos;t24 and{' '}
          <span className={styles.slideTextImportant}>
            you can farm it on banx.gg with no vesting.
          </span>
        </p>
      ),
    },
  ],
}

const BORROW_CONTENT = {
  title: 'Borrowing',
  slides: [
    {
      img: <img className={styles.slideImg} src={borrowImg1} alt="borrow 1" />,
      text: (
        <p className={styles.slideText}>
          <span className={styles.slideTextImportant}>Banx loans are perpetual</span>: they have no
          expiry, no fixed duration.
          <br />
          As the borrower, you can repay and exit any time. Interest accrues to the second so you
          never pay more than you need to.
        </p>
      ),
    },
  ],
}

const LEND_CONTENT = {
  title: 'Lending on Banx',
  slides: [
    {
      img: <img className={styles.slideImg} src={lendImg1} alt="lend 1" />,
      text: (
        <p className={styles.slideText}>
          As a lender, you can instantly earn yield by funding loans in the refinance auctions. Or
          you can lend via the orderbook, where you control exactly how much you offer.
          <br />
          You can automate your lending pools to reduce offer size the more you lend, and to place
          offers back in the orderbook as they are repaid.
        </p>
      ),
    },
  ],
}

const REFINANCE_CONTENT = {
  title: 'Refinancing',
  slides: [
    {
      img: <img className={styles.slideImg} src={refinanceImg1} alt="refinance 1" />,
      text: (
        <p className={styles.slideText}>
          Lenders can terminate loans if they wish to exit. The loan will be sent to the refinance
          auction, where it will be offered to other lenders on the same terms.
          <br />
          The auction continues until a new lender refinances, or the borrower repays in full. If
          neither happens after 72 hours, the NFT will be liquidated to the lender.
        </p>
      ),
    },
  ],
}

export const CONTENT = {
  [OnboardingModalContentType.DASHBOARD]: DASHBOARD_CONTENT,
  [OnboardingModalContentType.BORROW]: BORROW_CONTENT,
  [OnboardingModalContentType.LEND]: LEND_CONTENT,
  [OnboardingModalContentType.REFINANCE]: REFINANCE_CONTENT,
}
