import { useMarketsPreview } from './hooks'

export const LendPage = () => {
  const { marketsPreview } = useMarketsPreview()

  return (
    <div>
      {marketsPreview.map((_, key) => (
        <p key={key}>market</p>
      ))}
    </div>
  )
}
