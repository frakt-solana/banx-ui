import ActiveOffersTable from '../ActiveOffersTable'
import { useActiveOffersTab } from './hooks'

const ActiveOffersTab = () => {
  const { loans } = useActiveOffersTab()
  return <ActiveOffersTable data={loans} />
}

export default ActiveOffersTab
