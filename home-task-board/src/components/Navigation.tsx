'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/history', label: 'History', icon: '📅' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/milestones', label: 'Rewards', icon: '🎁' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:static md:border-t-0 md:border-r md:py-6 md:px-4 md:h-screen md:w-64">
      <div className="hidden md:block mb-8 px-2">
        <h1 className="text-xl font-bold text-gray-900">Home Tasks</h1>
        <p className="text-sm text-gray-500">Family Task Board</p>
      </div>
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
