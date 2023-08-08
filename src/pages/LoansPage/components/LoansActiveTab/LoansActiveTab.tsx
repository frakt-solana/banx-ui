import { LoansActiveTable } from '../LoansActiveTable'
import { useLoansActiveTab } from './hooks/useLoansActiveTab'

const LoansActiveTab = () => {
  const { sortViewParams, loans, loading } = useLoansActiveTab()

  return <LoansActiveTable data={loans} loading={loading} sortViewParams={sortViewParams} />
}

export default LoansActiveTab
