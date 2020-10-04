// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'

export default async (req, res) => {
  const {id, temperature, humidity} = req.body
  try {
    const result = await db.query({
      query: 'INSERT INTO env_records (device_id, unix_time, temperature, humidity) values (?, ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(4)) * 1000), ?, ?);',
      values: [id, temperature, humidity],
    })
    res.statusCode = 200
    res.json({ result })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}
