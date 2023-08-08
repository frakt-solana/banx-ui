import { useMarketsPreview } from '../../hooks'

export const useFilteredMarkets = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const showEmptyList = !isLoading && !marketsPreview?.length

  return {
    marketsPreview,
    isLoading,
    showEmptyList,
  }
}
