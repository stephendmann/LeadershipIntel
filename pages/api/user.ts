import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Clerk 身份测试
 * @param req
 * @param res
 * @returns
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Without Clerk env keys the middleware runs its no-auth fallback and
  // getAuth() throws, turning "auth not configured" into a 500.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Retrieve data from your database
    res.status(200).json({ userId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
