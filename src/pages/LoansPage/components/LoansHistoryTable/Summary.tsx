import { StatInfo } from '@banx/components/StatInfo'

import styles from './LoansHistoryTable.module.less'

export const Summary = () => {
  //TODO: Need take values from BE
  const totalLoans = 25
  const totalBorrowed = 25
  const totalDebt = 25
  const totalRepaid = 105

  //   const csvData = 'Collateral,Lent\n#5905,0.32\n#12305,12.06'

  return (
    <div className={styles.summary}>
      <div className={styles.totalOffers}>
        <p className={styles.totalOffersValue}>{totalLoans}</p>
        <div className={styles.totalOffersInfo}>
          <p className={styles.totalOffersInfoTitle}>Total loans</p>
          <p className={styles.totalOffersInfoSubtitle}>All time</p>
        </div>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total borrowed" value={totalBorrowed} />
        <StatInfo label="Total debt" value={totalDebt} />
        <StatInfo label="Total repaid" value={totalRepaid} />
      </div>
      {/* <CSVDownloadButton className={styles.summaryButton} data={csvData} filename="frakt.csv" /> */}
    </div>
  )
}
