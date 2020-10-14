// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'

export default async (req, res) => {
  const {id, count} = {
    id: -1,
    count: '1',
    ...req.query
  }
  try {
    const results = await db.query({
      query: `
        SELECT 
          unix_time as date_time,
          temperature,
          humidity
        FROM env_records 
        WHERE 
          device_id = ?
        ORDER BY
          date_time DESC
        LIMIT ?
        ;
      `,
      values: [id, parseInt(count)],
    })
    res.statusCode = 200
    res.json({ results })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}

