'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const taskNavItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/history', label: 'History', icon: '📅' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/milestones', label: 'Rewards', icon: '🎁' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/guide', label: 'Guide', icon: '❓' },
]

const expenseNavItems = [
  { href: '/expenses', label: 'Expenses', icon: '💰' },
  { href: '/expenses/summary', label: 'Summary', icon: '📊' },
  { href: '/expenses/settings', label: 'Settings', icon: '⚙️' },
]

export function Navigation() {
  const pathname = usePathname()
  const isExpenseSection = pathname.startsWith('/expenses')
  const navItems = isExpenseSection ? expenseNavItems : taskNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 md:static md:border-t-0 md:border-r md:py-6 md:px-4 md:h-screen md:w-64 z-50">
      {/* Desktop header */}
      <div className="hidden md:block mb-4 px-2">
        <h1 className="text-xl font-bold text-gray-900">Home Manager</h1>
        <p className="text-sm text-gray-500">Family Hub</p>
      </div>

      {/* Section toggle — desktop */}
      <div className="hidden md:flex gap-1 mb-6 px-2 bg-gray-100 rounded-lg p-1">
        <Link
          href="/"
          className={cn(
            'flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors',
            !isExpenseSection
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Tasks
        </Link>
        <Link
          href="/expenses"
          className={cn(
            'flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors',
            isExpenseSection
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Expenses
        </Link>
      </div>

      {/* Section toggle — mobile (top of bottom nav) */}
      <div className="flex gap-1 mb-1 bg-gray-100 rounded-md p-0.5 md:hidden">
        <Link
          href="/"
          className={cn(
            'flex-1 text-center py-1 rounded text-xs font-medium transition-colors',
            !isExpenseSection
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500'
          )}
        >
          Tasks
        </Link>
        <Link
          href="/expenses"
          className={cn(
            'flex-1 text-center py-1 rounded text-xs font-medium transition-colors',
            isExpenseSection
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500'
          )}
        >
          Expenses
        </Link>
      </div>

      {/* Nav items */}
      <ul className="flex justify-around md:flex-col md:gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="text-xl md:text-lg">{item.icon}</span>
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
