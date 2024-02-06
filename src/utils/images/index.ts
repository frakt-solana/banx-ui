import { TENSOR_CDN_URL } from '@banx/constants'

export const createImageSrcWithCdn = (src: string) => {
  return `${TENSOR_CDN_URL}/images/400x400/freeze=false/${src}`
}
