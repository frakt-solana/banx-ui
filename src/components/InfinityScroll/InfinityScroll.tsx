import classNames from 'classnames'
import InfiniteScrollComponent, { Props } from 'react-infinite-scroll-component'

import { Loader } from '../Loader'

interface InfinityScrollProps {
  itemsToShow?: number
  next: () => void
  infinityScrollProps?: Omit<Props, 'dataLength' | 'next' | 'hasMore' | 'children'>
  wrapperClassName?: string
  emptyMessage?: string
  emptyMessageClassName?: string
  isLoading?: boolean
  children: JSX.Element[]
  scrollableTargetId?: string
}

const InfinityScroll = ({
  itemsToShow = 20,
  next,
  wrapperClassName,
  isLoading = false,
  children,
  infinityScrollProps,
  scrollableTargetId = 'app-content',
}: InfinityScrollProps): JSX.Element => {
  if (isLoading) {
    return <Loader size={'large'} />
  }

  return (
    <InfiniteScrollComponent
      scrollableTarget={scrollableTargetId}
      next={next}
      dataLength={itemsToShow}
      hasMore={true}
      loader={false}
      style={{ overflow: 'initial' }}
      {...infinityScrollProps}
    >
      <div className={classNames(wrapperClassName)}>
        {children?.slice(0, itemsToShow).map((child) => child)}
      </div>
    </InfiniteScrollComponent>
  )
}

export default InfinityScroll
