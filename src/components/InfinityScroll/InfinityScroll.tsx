import { Fragment } from 'react'

import InfiniteScrollComponent, { Props } from 'react-infinite-scroll-component'

import { Loader } from '../Loader'

interface InfinityScrollProps extends Props {
  itemsToShow?: number
  wrapperClassName?: string
  isLoading?: boolean
  children: JSX.Element[]
}

const InfinityScroll = ({
  itemsToShow = 15,
  wrapperClassName,
  isLoading = false,
  children,
  ...restProps
}: InfinityScrollProps): JSX.Element => {
  if (isLoading) {
    return <Loader />
  }

  return (
    <InfiniteScrollComponent {...restProps} dataLength={itemsToShow} hasMore={true} loader={false}>
      <div className={wrapperClassName}>
        {children
          ?.slice(0, itemsToShow)
          .map((child, index) => <Fragment key={index}>{child}</Fragment>)}
      </div>
    </InfiniteScrollComponent>
  )
}

export default InfinityScroll
