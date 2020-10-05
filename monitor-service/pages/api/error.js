// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'

export default async (req, res) => {
  const {id, error} = req.body
  try {
    const result = await db.query({
      query: 'INSERT INTO errors (device_id, unix_time, error) values (?, ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(4)) * 1000), ?);',
      values: [id, error],
    })
    res.statusCode = 200
    res.json({ result })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}
