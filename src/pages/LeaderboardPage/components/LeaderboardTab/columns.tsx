import { ColumnsType } from 'antd/es/table'

import { HeaderCell, createColumn } from '@banx/components/TableComponents'

import { formatNumbersWithCommas } from '@banx/utils'

import { LeaderboardUserData } from './LeaderboardTab'
import { LoyaltyCell, UserInfoCell } from './components'

export const getTableColumns = () => {
  const columns: ColumnsType<LeaderboardUserData> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Rank, Profile" />,
      render: (_, stats) => <UserInfoCell {...stats} />,
    },
    {
      key: 'points',
      title: <HeaderCell label="Points" tooltipText="See <<Earn points>>" />,
      render: (_, { points }) => <>{formatNumbersWithCommas(points)}</>,
    },
    {
      key: 'loyalty',
      title: (
        <HeaderCell
          label="Loyalty"
          tooltipText="Loyalty tracks % of your loans on Banx vs other protocols. Loyalty impacts the amount of rewards; if you're more loyal you'll get much more rewards"
        />
      ),
      render: (_, { loyalty }) => <LoyaltyCell loyalty={loyalty} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
