export const isActivePath = (pathname = '') => {
  return location.pathname.split('/')[1] === pathname.split('/')[1]
}
