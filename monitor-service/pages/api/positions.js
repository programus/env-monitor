// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'

export default async (req, res) => {
  try {
    const results = await db.query({
      query: `
        SELECT 
          *
        FROM m_positions 
        ORDER BY
          display_order
        ;
      `,
    })
    res.statusCode = 200
    res.json({ results })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}

