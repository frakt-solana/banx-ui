import borrowImg1 from './assets/borrow1.png'
import borrowImg1_dark from './assets/borrow1_dark.png'
import dashboardImg1 from './assets/dashboard1.png'
import dashboardImg1_dark from './assets/dashboard1_dark.png'
import dashboardImg2 from './assets/dashboard2.png'
import dashboardImg2_dark from './assets/dashboard2_dark.png'
import dashboardImg3 from './assets/dashboard3.png'
import dashboardImg3_dark from './assets/dashboard3_dark.png'
import lendImg1 from './assets/lend1.png'
import lendImg1_dark from './assets/lend1_dark.png'
import refinanceImg1 from './assets/refinance1.png'
import refinanceImg1_dark from './assets/refinance1_dark.png'
import { OnboardingModalContentType } from './types'

import styles from './OnboardingModal.module.less'

const DASHBOARD_CONTENT = {
  title: 'What we are',
  slides: [
    {
      img: <img className={styles.slideImg} src={dashboardImg1} alt="dashboard 1" />,
      imgDark: <img className={styles.slideImg} src={dashboardImg1_dark} alt="dashboard 1" />,
      text: (
        <div className={styles.slideText}>
          <p>
            Banx is a blazing fast{' '}
            <span className={styles.slideTextImportant}>P2P NFT lending protocol</span>, with lower
            loan-to-value ratios, lower liquidation risk, and the lowest interest rates.
          </p>
        </div>
      ),
    },
    {
      img: <img className={styles.slideImg} src={dashboardImg2} alt="dashboard 2" />,
      imgDark: <img className={styles.slideImg} src={dashboardImg2_dark} alt="dashboard 2" />,
      text: (
        <div className={styles.slideText}>
          <p>
            <span className={styles.slideTextImportant}>Loans are perpetual</span>: they last at
            least 3 days and don&apos;t expire if you keep them healthy with small repayments.
          </p>
        </div>
      ),
    },
    {
      img: <img className={styles.slideImg} src={dashboardImg3} alt="dashboard 3" />,
      imgDark: <img className={styles.slideImg} src={dashboardImg3_dark} alt="dashboard 3" />,
      text: (
        <div className={styles.slideText}>
          <p>
            The $BANX token will hit the market in Q1&apos;24 and{' '}
            <span className={styles.slideTextImportant}>
              you can farm it on banx.gg with no vesting.
            </span>
          </p>
        </div>
      ),
    },
  ],
}

const BORROW_CONTENT = {
  title: 'Borrowing',
  slides: [
    {
      img: <img className={styles.slideImg} src={borrowImg1} alt="borrow 1" />,
      imgDark: <img className={styles.slideImg} src={borrowImg1_dark} alt="borrow 1" />,
      text: (
        <div className={styles.slideText}>
          <p>
            <span className={styles.slideTextImportant}>Banx loans are perpetual</span>: they have
            no expiry, no fixed duration.
          </p>
          <p>
            As the borrower, you can repay and exit any time. Interest accrues to the second so you
            never pay more than you need to.
          </p>
        </div>
      ),
    },
  ],
}

const LEND_CONTENT = {
  title: 'Lending on Banx',
  slides: [
    {
      img: <img className={styles.slideImg} src={lendImg1} alt="lend 1" />,
      imgDark: <img className={styles.slideImg} src={lendImg1_dark} alt="lend 1" />,
      text: (
        <div className={styles.slideText}>
          <p>
            As a lender, you can instantly earn yield by funding loans in the refinance auctions. Or
            you can lend via the orderbook, where you control exactly how much you offer.
          </p>
          <p>
            You can automate your lending pools to reduce offer size the more you lend, and to place
            offers back in the orderbook as they are repaid.
          </p>
        </div>
      ),
    },
  ],
}

const REFINANCE_CONTENT = {
  title: 'Refinancing',
  slides: [
    {
      img: <img className={styles.slideImg} src={refinanceImg1} alt="refinance 1" />,
      imgDark: <img className={styles.slideImg} src={refinanceImg1_dark} alt="refinance 1" />,
      text: (
        <div className={styles.slideText}>
          <p>
            Lenders can terminate loans if they wish to exit. The loan will be sent to the refinance
            auction, where it will be offered to other lenders on the same terms.
          </p>
          <p>
            The auction continues until a new lender refinances, or the borrower repays in full. If
            neither happens after 72 hours, the NFT will be liquidated to the lender.
          </p>
        </div>
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
