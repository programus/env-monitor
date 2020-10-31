import db from '../../lib/db'
import mail from '../../lib/mail'

export default async (req, res) => {
  const {id, vcc} = req.body
  try {
    const dbResult = await db.query({
      query: 'REPLACE INTO vcc_last (device_id, unix_time, vcc) values (?, ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(4)) * 1000), ?);',
      values: [id, vcc],
    })
    const result = {
      db: dbResult,
    }
    if (vcc < Number(process.env.VCC_WARNING || 0)) {
      const mailResult = await mail.send({
        subject: `[Home Env] WARNING: Low Voltage ([${id}]: ${vcc})`,
        text: `The power for sensor[${id}] is ${vcc} which is lower than the WARNING threshold ${process.env.VCC_WARNING}`
      })
      result.mail = mailResult
    }
    res.statusCode = 200
    res.json({ result })
  } catch (error) {
    res.statusCode = 500
    res.json({ error })
  }
}
