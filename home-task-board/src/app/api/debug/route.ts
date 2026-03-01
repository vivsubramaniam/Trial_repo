import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`
    return NextResponse.json({
      dbUrlPrefix: dbUrl.substring(0, 40),
      dbUrlHost: dbUrl.includes('@') ? dbUrl.split('@')[1]?.split('/')[0] : 'unknown',
      connected: true,
      result,
    })
  } catch (error) {
    return NextResponse.json({
      dbUrlPrefix: dbUrl.substring(0, 40),
      dbUrlHost: dbUrl.includes('@') ? dbUrl.split('@')[1]?.split('/')[0] : 'unknown',
      connected: false,
      error: String(error),
    })
  }
}
