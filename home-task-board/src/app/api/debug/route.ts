import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
    hasNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    prismaUrlPrefix: process.env.POSTGRES_PRISMA_URL?.substring(0, 30) || 'not set',
    nodeEnv: process.env.NODE_ENV,
  })
}
