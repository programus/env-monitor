// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'

export default async (req, res) => {
  const {id, from, to, unit} = req.query
  const unitMs = unit * 60000   // min -> ms
  try {
    const results = await db.query({
      query: `
        SELECT 
          ROUND(unix_time / ${unitMs}) * ${unitMs} as date_time, 
          AVG(temperature) AS temperature,
          AVG(humidity) AS humidity,
          MIN(temperature) AS min_temperature,
          MIN(humidity) AS min_humidity,
          MAX(temperature) AS max_temperature,
          MAX(humidity) AS max_humidity,
          COUNT(*) AS sample_count 
        FROM env_records 
        WHERE 
          device_id = ?
          AND
          unix_time BETWEEN ? AND ?
        GROUP BY 
          date_time
        ORDER BY
          date_time
        ;
      `,
      values: [id, from, to],
    })
    res.statusCode = 200
    res.json({ results })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}

