import { useEffect, useRef, useState } from 'react'

import { isEqual } from 'lodash'

import { TABLET_WIDTH } from '@banx/constants'
import { useLocalStorage, useOnClickOutside, useWindowSize } from '@banx/hooks'

const MAX_TAG_TEXT_LENGTH = 15

export const useSearchSelect = ({
  selectedOptions,
  collapsed,
  onChangeCollapsed,
}: {
  selectedOptions: string[]
  collapsed?: boolean
  onChangeCollapsed?: (value: boolean) => void
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
    togglePopupVisible(!collapsed)
  }

  const showSufixIcon = !selectedOptions?.length && !inputValue
  const showCollapsedContent = collapsed && isMobile && onChangeCollapsed

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
  const storageKey = `@banx.favorite_${key}`

  const [favoriteOptions, setFavoriteOptions] = useLocalStorage<OptionType[]>(storageKey, [])

  const isOptionFavorite = (option: OptionType) =>
    favoriteOptions.some((fav) => isEqual(fav, option))

  const toggleFavorite = (option: OptionType) => {
    setFavoriteOptions((prevFavorites) => {
      if (isOptionFavorite(option)) {
        return prevFavorites.filter((key) => !isEqual(key, option))
      }
      return [...prevFavorites, option]
    })
  }

  const sortOptionsByFavoriteStatus = (options: OptionType[]) => {
    const nonFavoriteOptions = options.filter((option) => !isOptionFavorite(option))
    return [...favoriteOptions, ...nonFavoriteOptions]
  }

  return { favoriteOptions, toggleFavorite, sortOptionsByFavoriteStatus, isOptionFavorite }
}
