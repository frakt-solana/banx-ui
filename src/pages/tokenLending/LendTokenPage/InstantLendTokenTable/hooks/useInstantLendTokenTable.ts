import { useAllTokenLoansRequests } from './useAllTokenLoansRequests'

export const useInstantLendTokenTable = () => {
  const { loans, isLoading } = useAllTokenLoansRequests()

  return { loans: loans as any[], isLoading }
}
