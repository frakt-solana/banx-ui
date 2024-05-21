import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { user } from '@banx/api/common'

import { PointsCell, UserInfoCell } from './components'

export const getTableColumns = () => {
  const columns: ColumnType<user.LeaderboardData>[] = [
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
  ]

  return columns
}
