import borrowImg1 from './assets/borrow1.png'
import borrowImg1_dark from './assets/borrow1_dark.png'
import dashboardImg1 from './assets/dashboard1.png'
import dashboardImg1_dark from './assets/dashboard1_dark.png'
import dashboardImg2 from './assets/dashboard2.png'
import dashboardImg2_dark from './assets/dashboard2_dark.png'
import lendImg1 from './assets/lend1.png'
import lendImg1_dark from './assets/lend1_dark.png'
import loansImg1 from './assets/loans1.png'
import loansImg1_dark from './assets/loans1_dark.png'
import offersImg1 from './assets/offers1.png'
import offersImg1_dark from './assets/offers1_dark.png'
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
            Banx is a <span className={styles.slideTextImportant}>p2p lending protocol</span>, with
            no fixed duration, fixed pro-rata interest and passive yield on idle liquidity.
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
            <span className={styles.slideTextImportant}>Loans are perpetual:</span> they last at
            least 3 days and don&apos;t expire if you keep them healthy with small repayments.
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
            <span className={styles.slideTextImportant}>Banx loans are perpetual:</span> they have
            no expiry, no fixed duration. As the borrower, you can repay and exit anytime.
          </p>
          <p>
            <span className={styles.slideTextImportant}>Interest rates </span>
            are set once you borrow and accrued only for the time you borrow. Typically, low LTV
            loans are the safest way to borrow, benefiting from lower interest and lower refinancing
            call risk.
          </p>
          <p>
            <span className={styles.slideTextImportant}>Loan status </span>
            will change from Active to Terminating if you receive a refinancing call. You will have
            72 hours to extend to a new offer or repay in full, otherwise your NFT will be
            liquidated.
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
            <span className={styles.slideTextImportant}>Create offers </span>
            for collateral you want to lend against. Loan requests are fulfilled by the closest
            offer value, meaning the highest offer isn’t necessarily the one that is taken.
          </p>
          <p>
            <span className={styles.slideTextImportant}>Interest rate </span> Once an offer is
            taken, it becomes fixed.
          </p>
          <p>
            <span className={styles.slideTextImportant}>On repayment </span>
            offers are replenished, you can close them on MY OFFERS page.
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
            neither happens after 72 hours, the collateral will be liquidated to the lender.
          </p>
        </div>
      ),
    },
  ],
}

const OFFERS_CONTENT = {
  title: 'My offers',
  slides: [
    {
      img: <img className={styles.slideImg} src={offersImg1} alt="offers 1" />,
      imgDark: <img className={styles.slideImg} src={offersImg1_dark} alt="offers 1" />,
      text: (
        <div className={styles.slideText}>
          <p>
            <span className={styles.slideTextImportant}>The Pending tab</span> shows offers not yet
            taken. Monitor and adjust risk of existing offers by: editing {'Max Offer'},
            adding/removing liquidity, or closing the offer and recovering liquidity not lent.
          </p>
          <p>
            <span className={styles.slideTextImportant}>The Active tab</span> shows offers taken.
            Monitor the risk of your active offers and {`'Manage' -> 'Terminate`} loans if you wish
            to exit, recovering either liquidity or collateral within 72 hours.
          </p>
          <p>
            <span className={styles.slideTextImportant}>The History tab</span> shows a record of
            offers being initiated, repaid or liquidated.
          </p>
        </div>
      ),
    },
  ],
}

const LOANS_CONTENT = {
  title: 'My loans',
  slides: [
    {
      img: <img className={styles.slideImg} src={loansImg1} alt="loans 1" />,
      imgDark: <img className={styles.slideImg} src={loansImg1_dark} alt="loans 1" />,
      text: (
        <div className={styles.slideText}>
          <p>
            <span className={styles.slideTextImportant}>View and manage</span>
            your active loans here. Monitor the loan-to-value [LTV] and reduce risk by making
            partial repayments via the Repay button.
          </p>
          <p>
            <span className={styles.slideTextImportant}>Rollover </span>
            allows you to borrow more with higher interest, or less with lower interest, depending
            on available offers.
          </p>
          <p>
            <span className={styles.slideTextImportant}>Loan status </span>
            will change from Active to Terminating if you receive a refinancing call. You will have
            72 hours to rollover to a new offer or repay in full, otherwise your collateral will be
            liquidated.
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
  [OnboardingModalContentType.OFFERS]: OFFERS_CONTENT,
  [OnboardingModalContentType.LOANS]: LOANS_CONTENT,
}
