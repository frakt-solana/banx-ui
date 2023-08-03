import { TableView } from './views'

const Table = ({
  data,
  columns,
  onRowClick,
  rowKeyField = 'id',
  loading = false,
  className,
  breakpoints,
  viewParams,
  cardClassName,
}: any): JSX.Element => {
  const showCard = viewParams?.showCard

  return (
    <TableView
      className="rootTableClassName"
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      rowKeyField={rowKeyField}
      // className={showCard ? cardClassName : className}
      breakpoints={breakpoints}
      loading={loading}
    />
  )
}

export { Table }
