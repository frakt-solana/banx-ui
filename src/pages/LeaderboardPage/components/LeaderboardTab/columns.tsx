import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { LeaderboardData } from '@banx/api/user'

import { LoyaltyCell, PointsCell, UserInfoCell } from './components'

export const getTableColumns = () => {
  const columns: ColumnType<LeaderboardData>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Rank, Profile" align="left" />,
      render: ({ user, rank, avatar }) => (
        <UserInfoCell user={user} rank={rank} avatar={avatar ?? ''} />
      ),
    },
    {
      key: 'points',
      title: <HeaderCell label="Points" />,
      render: ({ points }) => <PointsCell points={points} />,
    },
    {
      key: 'loyalty',
      title: (
        <HeaderCell
          label="Loyalty"
          tooltipText="Loyalty tracks % of your loans on Banx vs other protocols. Loyalty impacts the amount of rewards; if you're more loyal you'll get much more rewards"
        />
      ),
      render: ({ loyalty }) => <LoyaltyCell loyalty={loyalty} />,
    },
  ]

  return columns
}
