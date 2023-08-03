import { ColumnsType } from 'antd/es/table'

import { HeaderCell } from '@banx/components/TableCells'

export const getTableList = () => {
  const COLUMNS: ColumnsType | any = [
    {
      key: 'collectionName',
      dataIndex: 'collectionName',
      title: () => <HeaderCell label="Collection Name" value="collectionName" />,
      render: (value: any) => <span>{value}</span>,
      width: 150,
    },
    {
      key: 'activeBondsAmount',
      dataIndex: 'activeBondsAmount',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Active loans" value="activeBondsAmount" />
      ),
      render: (value: any) => <span>{value}</span>,
      showSorterTooltip: false,
    },
    {
      key: 'bestOffer',
      dataIndex: 'bestOffer',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Best offer" value="bestOffer" />
      ),
      render: (value: any) => <span>{value}</span>,
      sort: true,
    },
    {
      key: 'apy',
      dataIndex: 'apy',
      title: (column: any) => <HeaderCell columns={column?.sortColumns} label="APY" value="apy" />,
      render: (value: any) => <span>{value}</span>,
    },
    {
      key: 'offerTVL',
      dataIndex: 'offerTVL',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Offer TVL" value="offerTVL" />
      ),
      render: (value: any) => <span>{value}</span>,
    },
    {
      key: 'duration',
      dataIndex: 'duration',
      title: (column: any) => (
        <HeaderCell columns={column?.sortColumns} label="Duration" value="duration" />
      ),
      render: (value: any) => <span>{value}</span>,
    },
  ]

  return COLUMNS
}
