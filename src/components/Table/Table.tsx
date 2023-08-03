import { TableView } from './views'

const Table = ({
  data,
  columns,
  onRowClick,
  rowKeyField = 'id',
  loading = false,
  breakpoints,
}: any): JSX.Element => {
  return (
    <TableView
      className="rootTableClassName"
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      rowKeyField={rowKeyField}
      breakpoints={breakpoints}
      loading={loading}
    />
  )
}

export { Table }
