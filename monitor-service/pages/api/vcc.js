// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'

export default async (req, res) => {
  const {id, vcc} = req.body
  try {
    const result = await db.query({
      query: 'REPLACE INTO vcc_last (device_id, unix_time, vcc) values (?, ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(4)) * 1000), ?);',
      values: [id, vcc],
    })
    res.statusCode = 200
    res.json({ result })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}
