import { useLocation, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Profile from './Profile.jsx'
import Logo from './Logo.jsx'
import IconLabels from './mNavElements.jsx'
import NavElements from './NavElements.jsx' // Renamed from LabeledIcon

// Icons
import HomeIcon from '../assets/home-11-stroke-rounded.jsx'
import MenuIcon from '../assets/coffee-02-stroke-rounded.jsx'
import InventoryIcon from '../assets/shipping-truck-02-stroke-rounded.jsx'
import SalesIcon from '../assets/clock-01-stroke-rounded.jsx'
import AccountsIcon from '../assets/user-stroke-rounded.jsx'
import SettingsIcon from '../assets/settings-01.jsx'
import LogoutIcon from '../assets/logout-03-stroke-rounded.jsx'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const handleLogout = async () => {
    try {
      // Optionally, you can make an API call to the logout endpoint
      await axios.post('http://localhost:3000/auth/logout') // This won't have any effect in JWT but can be used for logging purposes
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Remove the token from local storage
      localStorage.removeItem('token') // Or wherever you store your JWT
      navigate('/signin') // Redirect to sign-in page
    }
  }

  const navItems = [
    { path: '/', Icon: HomeIcon, label: 'Home' },
    { path: '/menu', Icon: MenuIcon, label: 'Menu' },
    { path: '/products', Icon: InventoryIcon, label: 'Products' },
    { path: '/sales', Icon: SalesIcon, label: 'Sales' },
    { path: '/accounts', Icon: AccountsIcon, label: 'Accounts' },
    { path: '/settings', Icon: SettingsIcon, label: 'Settings' },
    { path: '/logout', Icon: LogoutIcon, label: 'Logout' },
  ]

  return (
    <div className="h-screen bg-tertiary w-[80%] sm:w-[120px]">
      {/* Full words for small screens */}
      <div className="flex flex-col h-full sm:hidden">
        <Profile className="" />
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            <IconLabels Image={item.Icon} Label={item.label} />
          </NavLink>
        ))}
      </div>

      <div className="flex-col w-full h-full items-center justify-between hidden sm:flex">
        <div className="flex flex-col items-center w-full">
          <Logo />
          {navItems.slice(0, -1).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="w-[70%] flex justify-center"
            >
              <NavElements
                Image={item.Icon}
                Label={item.label}
                isActive={currentPath === item.path}
                onClick={() => {}}
              />
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col items-center ">
          <NavElements
            Image={navItems[navItems.length - 1].Icon}
            Label={navItems[navItems.length - 1].label}
            isActive={currentPath === navItems[navItems.length - 1].path}
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  )
}
