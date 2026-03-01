'use client'

import { Card } from '@/components'

const steps = [
  {
    icon: '👤',
    title: '1. Add Family Members',
    description:
      'Go to the Profile page and add everyone in the household. Each person gets their own points balance and streak tracker.',
  },
  {
    icon: '📋',
    title: '2. Create Tasks',
    description:
      'From the Dashboard, tap "+ Add Task" to create chores. Set the point value, how often it repeats (daily, weekly, one-time, or specific days), and optionally assign it to someone.',
  },
  {
    icon: '✅',
    title: '3. Complete Tasks',
    description:
      'Select your name on the Dashboard, then tap the checkmark on tasks as you finish them. You\'ll earn base points plus any streak bonus.',
  },
  {
    icon: '🔥',
    title: '4. Build Streaks',
    description:
      'Complete at least one task every day to build a streak. Your bonus grows from +1 up to +7 extra points per task. Miss a day and it resets!',
  },
  {
    icon: '🎁',
    title: '5. Redeem Rewards',
    description:
      'Head to the Rewards Shop to spend your points on rewards the family has set up — things like "Pizza Night", "Extra Screen Time", or "Pick the Movie".',
  },
  {
    icon: '🏆',
    title: '6. Check the Leaderboard',
    description:
      'See who\'s earning the most points. The Leaderboard shows both spendable points and lifetime totals.',
  },
]

const pages = [
  { icon: '🏠', name: 'Dashboard', description: 'Your daily hub — see today\'s tasks, complete them, and add new ones.' },
  { icon: '📋', name: 'Tasks', description: 'Manage all tasks — edit, delete, or deactivate tasks.' },
  { icon: '📅', name: 'History', description: 'View past completions grouped by date.' },
  { icon: '🏆', name: 'Leaderboard', description: 'Family rankings by points.' },
  { icon: '🎁', name: 'Rewards', description: 'Browse and redeem rewards with your earned points.' },
  { icon: '👤', name: 'Profile', description: 'Add or edit family members.' },
]

export default function GuidePage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">How It Works</h1>
        <p className="text-gray-500 mt-1">
          Home Task Board helps your family stay on top of household chores by turning them into a points game.
          Complete tasks, earn points, build streaks, and redeem rewards!
        </p>
      </header>

      {/* Getting Started */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Getting Started</h2>
        <div className="space-y-3">
          {steps.map((step) => (
            <Card key={step.title}>
              <div className="p-4 flex gap-4">
                <span className="text-2xl flex-shrink-0">{step.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Points System */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Points System</h2>
        <Card>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Earning Points</h3>
              <p className="text-sm text-gray-600 mt-1">
                Each task has a base point value. When you complete a task, you earn the base points plus your current streak bonus.
                For example, a 10-point task with a +3 streak bonus earns you 13 points.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Two Point Balances</h3>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Spendable Points</strong> are what you can use in the Rewards Shop. When you redeem a reward, these go down.
                <br />
                <strong>Lifetime Points</strong> track your all-time total and never decrease — they show on the Leaderboard for bragging rights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Streak Bonus</h3>
              <p className="text-sm text-gray-600 mt-1">
                Complete at least one task per day to grow your streak bonus from +1 up to +7.
                Miss a day and your bonus resets back to +1. The bonus is added to every task you complete that day.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Page Guide */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pages</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.name}>
              <div className="p-4 flex gap-3 items-start">
                <span className="text-xl">{page.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{page.name}</h3>
                  <p className="text-sm text-gray-600">{page.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tips</h2>
        <Card>
          <ul className="p-4 space-y-2 text-sm text-gray-600">
            <li>- Assign high-point tasks to make sure the hard chores get done</li>
            <li>- Leave tasks unassigned ("Shared") so anyone can grab them</li>
            <li>- Set up fun rewards to keep everyone motivated</li>
            <li>- Check the History page to see who did what and when</li>
            <li>- Use one-time tasks for special chores like "Clean the garage"</li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
