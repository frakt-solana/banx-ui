import { useEffect, useRef, useState } from 'react'

import { isEqual } from 'lodash'

import { TABLET_WIDTH } from '@banx/constants'
import { useLocalStorage, useOnClickOutside, useWindowSize } from '@banx/hooks'

const MAX_TAG_TEXT_LENGTH = 15

export const useSearchSelect = ({
  selectedOptions,
  collapsed,
  onChangeCollapsed,
  defaultCollapsed,
}: {
  selectedOptions: string[]
  collapsed?: boolean
  onChangeCollapsed?: (value: boolean) => void
  defaultCollapsed?: boolean
}) => {
  const containerRef = useRef(null)

  const { width } = useWindowSize()
  const isMobile = width <= TABLET_WIDTH

  const handleClickOutside = () => {
    if (onChangeCollapsed) {
      onChangeCollapsed(true)
    }
  }

  useOnClickOutside(containerRef, handleClickOutside)

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    setInputValue('')
  }, [selectedOptions])

  const handleInputChange = (value: string) => {
    const limitedValue = value.slice(0, MAX_TAG_TEXT_LENGTH)
    setInputValue(limitedValue)
  }

  const togglePopupVisible = (visible: boolean) => {
    setIsPopupOpen(visible)
  }

  const handleCollapseClick = () => {
    onChangeCollapsed?.(!collapsed)
    setIsPopupOpen(true)
  }

  const showSufixIcon = !selectedOptions?.length && !inputValue

  const shouldShowCollapsedContent = collapsed && onChangeCollapsed

  const showCollapsedContent = defaultCollapsed
    ? shouldShowCollapsedContent
    : shouldShowCollapsedContent && isMobile

  return {
    containerRef,
    isPopupOpen,

    inputValue,
    handleInputChange,
    togglePopupVisible,

    showSufixIcon,
    showCollapsedContent,

    handleCollapseClick,
  }
}

export const useFavoriteOptions = <OptionType>(key: string) => {
  const storageKey = `@banx.favorites`

  const [favoriteOptions, setFavoriteOptions] = useLocalStorage<{ [key: string]: OptionType[] }>(
    storageKey,
    {},
  )

  const isOptionFavorite = (option: OptionType) =>
    favoriteOptions[key]?.some((fav) => isEqual(fav, option)) || false

  const toggleFavorite = (option: OptionType) => {
    setFavoriteOptions((prevFavorites) => {
      const favoritesForKey = prevFavorites[key] || []
      if (isOptionFavorite(option)) {
        return { ...prevFavorites, [key]: favoritesForKey.filter((fav) => !isEqual(fav, option)) }
      }
      return { ...prevFavorites, [key]: [...favoritesForKey, option] }
    })
  }

  const sortOptionsByFavoriteStatus = (options: OptionType[]) => {
    const nonFavoriteOptions = options.filter((option) => !isOptionFavorite(option))
    return [...(favoriteOptions[key] || []), ...nonFavoriteOptions]
  }

  return {
    favoriteOptions: favoriteOptions[key] || [],
    toggleFavorite,
    sortOptionsByFavoriteStatus,
    isOptionFavorite,
  }
}
