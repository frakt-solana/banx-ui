import { OnboardButton } from '@banx/components/Buttons'
import { PageHeaderBackdrop } from '@banx/components/PageHeader'

const BorrowHeader = () => {
  return (
    <PageHeaderBackdrop
      title="Borrow"
      titleBtn={<OnboardButton contentType="borrow" />}
    ></PageHeaderBackdrop>
  )
}

export default BorrowHeader
