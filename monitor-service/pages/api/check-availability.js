// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import db from '../../lib/db'
import moment from 'moment'
import mail from '../../lib/mail'

const sendEmail = async (e, last) => {
  return mail.send({
    subject: `[Home Env] Sensor[${e.device_id}] at ${e.position_name} stopped working`,
    text: `
      Sensor[${e.device_id}] at ${e.position_name} stopped working
      from ${moment(last.date_time).format('YYYY-MM-DD HH:mm:ss')}.
    
      Check it please. 
    `
  })
}

export default async (req, res) => {
  const {id} = {
    id: -1,
    ...req.body,
  }
  try {
    const positions = await db.query({
      query: `
        SELECT 
          device_id,
          position_name
        FROM m_positions 
        ${id >= 0 ? 'WHERE device_id = ? ' : ''}
        ;
      `,
      values: [id],
    })

    const results = await Promise.all(positions.map(async e => {
      const recent = await db.query({
        query: `
          SELECT 
            unix_time as date_time
          FROM env_records
          WHERE device_id = ?
          ORDER BY
            date_time DESC
          LIMIT ?
          ;
        `,
        values: [e.device_id, parseInt(process.env.SAMPLE_COUNT || 100)],
      })
      const sortedDiffs = recent.slice(1).map((r, i) => recent[i].date_time - r.date_time ).sort()
      if (sortedDiffs.length > 3) {
        const last = recent[recent.length - 1]
        const medianDiff = sortedDiffs[parseInt(sortedDiffs.length / 2)]
        const checkInterval = (process.env.CHECK_INTERVAL || 60) * 60000  // min -> ms
        const reportInterval = (process.env.REPORT_INTERVAL || Infinity) * 60000 // min -> ms
        const timeoutTime = process.env.TIMEOUT_TIME || 5
        const now = Date.now()
        const interval = (now - last.date_time) % reportInterval
        const isTimeout = interval > medianDiff * timeoutTime && interval < checkInterval

        const ret = {
          position: e,
          now,
          last,
          interval, 
          timeoutTime,
          medianDiff,
          checkInterval,
          reportInterval,
          isTimeout,
        }

        if (isTimeout) {
          ret.email = await sendEmail(e, last)
        }
        return ret
      }
      return {
      }
    }));
    res.statusCode = 200
    res.json({ results })
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.json({ error })
  }
}

