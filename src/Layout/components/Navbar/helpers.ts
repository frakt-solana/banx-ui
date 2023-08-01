export const isActivePath = (pathname = ''): boolean => {
  return location.pathname.split('/')[1] === pathname.split('/')[1]
}
