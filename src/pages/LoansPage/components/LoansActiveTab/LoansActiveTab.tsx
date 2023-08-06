import { LoansActiveTable } from '../LoansActiveTable'
import { useLoansActiveTab } from './hooks/useLoansActiveTab'

const LoansActiveTab = () => {
  const { sortViewParams, loans, loading } = useLoansActiveTab()

  return (
    <div style={{ padding: 16 }}>
      <LoansActiveTable data={loans} loading={loading} sortViewParams={sortViewParams} />
    </div>
  )
}

export default LoansActiveTab
