'use client'

import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  photoPath?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showName?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

export function UserAvatar({ name, photoPath, size = 'md', className, showName = false }: UserAvatarProps) {
  const initials = getInitials(name)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-primary-100 flex items-center justify-center font-medium text-primary-700',
          sizeClasses[size]
        )}
      >
        {photoPath ? (
          <Image
            src={photoPath}
            alt={name}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {showName && <span className="font-medium text-gray-900">{name}</span>}
    </div>
  )
}
