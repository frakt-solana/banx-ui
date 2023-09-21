import React from 'react'

import { BorrowCard, LendCard } from '../Card'

const DashboardLendTab = () => {
  return (
    <div>
      <LendCard image="" amountOfLoans={1211} offerTvl={2133} apy={10} />
      <BorrowCard image="" dailyFee={0.05} maxAvailableToBorrow={10} />
    </div>
  )
}

export default DashboardLendTab
