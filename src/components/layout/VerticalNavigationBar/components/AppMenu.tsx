"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useLayoutContext } from '@/context/useLayoutContext'
import { findAllParent, findMenuItem, getMenuItemFromURL } from '@/helpers/Manu'
import type { MenuItemType, SubMenus } from '@/types/menu'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useCallback, useEffect, useState, type MouseEvent } from 'react'
import { Collapse, OverlayTrigger, Tooltip } from 'react-bootstrap'


const MenuItemWithChildren = ({ item, className, linkClassName, subMenuClassName, activeMenuItems, toggleMenu, level }: SubMenus) => {
  const [open, setOpen] = useState<boolean>(activeMenuItems!.includes(item.key))
  const level1 = level === 1
  useEffect(() => {
    setOpen(activeMenuItems!.includes(item.key))
  }, [activeMenuItems, item])

  const toggleMenuItem = (e: MouseEvent<HTMLParagraphElement>) => {
    e.preventDefault()
    const status = !open
    setOpen(status)
    if (toggleMenu) toggleMenu(item, status)
    return false
  }

  const getActiveClass = useCallback(
    (item: MenuItemType) => {
      return activeMenuItems?.includes(item.key) ? 'active' : ''
    },
    [activeMenuItems],
  )

  return (
    <li className={className}>
      <div onClick={toggleMenuItem} aria-expanded={open} role="button" className={clsx(linkClassName)}>
        {item.icon && (
          <span className="menu-icon">
            <IconifyIcon icon={item.icon} />
          </span>
        )}
        {level1 ? <span className="menu-text">{item.label}</span> :
          <Link href=""><span >{item.label}</span>
            {/* <div className='menu-arrow'>
              <IconifyIcon icon="tabler:chevron-right" width={19} height={19} />
            </div> */}
          </Link>}
        {!item.badge ? (
          <>
            {level1 &&
              <span className='menu-arrow'>
                <IconifyIcon icon="tabler:chevron-right" width={19} height={19} />
              </span>
            }
          </>
        ) : (
          <>
            <span className={`badge rounded-pill text-end bg-${item.badge.variant}`}>{item.badge.text}</span>
          </>
        )}

      </div>
      <div className={clsx(
        'overflow-hidden transition-all duration-300 ease-in-out',
        open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div>
          <ul className={clsx(
            subMenuClassName,
            'list-none flex flex-col gap-1 pl-0 mt-1'
          )}>
            {(item.children || []).map((child, idx) => {
              return (
                <Fragment key={child.key + idx}>
                  {child.children ? (
                    <MenuItemWithChildren
                      item={child}
                      linkClassName={clsx(
                        'nav-link text-sm px-6 py-2',
                        'ml-7', // Indent for nested items
                        getActiveClass(child)
                      )}
                      activeMenuItems={activeMenuItems}
                      className="side-nav-item"
                      level={level + 1}
                      subMenuClassName="sub-menu pl-3"
                      toggleMenu={toggleMenu}
                    />
                  ) : (
                    <MenuItem 
                      level={level + 1} 
                      item={child} 
                      className={clsx(
                        'side-nav-item',
                        getActiveClass(child)
                      )} 
                      linkClassName={clsx(
                        'side-nav-link text-sm',
                        '', // Indent for nested items
                        getActiveClass(child)
                      )} 
                    />
                  )}
                </Fragment>
              )
            })}
          </ul>
        </div>
      </div>
    </li>
  )
}

const MenuItem = ({ item, className, linkClassName, level }: SubMenus) => {
  return (
    <li className={className}>
      <MenuItemLink item={item} level={level + 1} className={linkClassName} />
    </li>
  )
}

const MenuItemLink = ({ item, className }: SubMenus) => {
  const { toggleBackdrop, menu } = useLayoutContext()

  const ToggleMenu = () => {
    if (menu.size == 'full') {
      toggleBackdrop()
    }
  }
  return (
    <Link href={item.url ?? ''} onClick={ToggleMenu} target={item.target} className={clsx(className, { disabled: item.isDisabled })}>
      {item.icon && (
        <span className="menu-icon">
          <IconifyIcon icon={item.icon} />
        </span>
      )}
      {!item.icon && <IconifyIcon icon="tabler:circle-filled" />}
      <span className="menu-text">{item.label}</span>
      {item.badge && <span className={`badge rounded-pill text-end bg-${item.badge.variant}`}>{item.badge.text}</span>}
      {item.badgeIcon &&

        <OverlayTrigger placement="top" overlay={<Tooltip className="tooltip-warning">Your wallet balance is <b>low!</b></Tooltip>}>
          <span className="badge p-0 menu-alert fs-16 text-danger">
            <IconifyIcon icon={item.badgeIcon} data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="" data-bs-title="" />
          </span>
        </OverlayTrigger>

      }
    </Link>
  )
}

type AppMenuProps = {
  menuItems: Array<MenuItemType>
}

const AppMenu = ({ menuItems }: AppMenuProps) => {
  const pathname = usePathname()

  const [activeMenuItems, setActiveMenuItems] = useState<Array<string>>([])
  const toggleMenu = (menuItem: MenuItemType, show: boolean) => {
    if (show) setActiveMenuItems([menuItem.key, ...findAllParent(menuItems, menuItem)])
  }

  const getActiveClass = useCallback(
    (item: MenuItemType) => {
      return activeMenuItems?.includes(item.key) ? 'active' : ''
    },
    [activeMenuItems],
  )

  const activeMenu = useCallback(() => {
    const trimmedURL = pathname?.replaceAll('', '')
    const matchingMenuItem = getMenuItemFromURL(menuItems, trimmedURL)

    if (matchingMenuItem) {
      const activeMt = findMenuItem(menuItems, matchingMenuItem.key)
      if (activeMt) {
        setActiveMenuItems([activeMt.key, ...findAllParent(menuItems, activeMt)])
      }

      setTimeout(() => {
        const activatedItem: HTMLAnchorElement | null = document.querySelector(`#leftside-menu-container .simplebar-content a[href="${trimmedURL}"]`)
        if (activatedItem) {
          const simplebarContent = document.querySelector('#leftside-menu-container .simplebar-content-wrapper')
          if (simplebarContent) {
            const offset = activatedItem.offsetTop - window.innerHeight * 0.4
            scrollTo(simplebarContent, offset, 600)
          }
        }
      }, 400)

      // scrollTo (Left Side Bar Active Menu)
      const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2
        if (t < 1) return (c / 2) * t * t + b
        t--
        return (-c / 2) * (t * (t - 2) - 1) + b
      }

      const scrollTo = (element: Element, to: number, duration: number) => {
        const start = element.scrollTop,
          change = to - start,
          increment = 20
        let currentTime = 0
        const animateScroll = function () {
          currentTime += increment
          const val = easeInOutQuad(currentTime, start, change, duration)
          element.scrollTop = val
          if (currentTime < duration) {
            setTimeout(animateScroll, increment)
          }
        }
        animateScroll()
      }
    }
  }, [pathname, menuItems])

  useEffect(() => {
    if (menuItems && menuItems.length > 0) activeMenu()
  }, [activeMenu, menuItems])

  return (
    <ul className="side-nav">
      {(menuItems || []).map((item, idx) => {
        return (
          <Fragment key={item.key + idx}>
            {item.isTitle ? (
              <li className={clsx('side-nav-title', { 'mt-2': idx != 0 })} >{item.label}</li>
            ) : (
              <>
                {item.children ? (
                  <MenuItemWithChildren
                    item={item}
                    toggleMenu={toggleMenu}
                    className="side-nav-item"
                    level={1}
                    linkClassName={clsx('side-nav-link', getActiveClass(item))}
                    subMenuClassName="sub-menu"
                    activeMenuItems={activeMenuItems}
                  />
                ) : (
                  <MenuItem item={item} level={1} linkClassName={clsx('side-nav-link', getActiveClass(item))} className={clsx('side-nav-item', getActiveClass(item))} />
                )}
              </>
            )}
          </Fragment>
        )
      })}
    </ul>
  )
}

export default AppMenu

