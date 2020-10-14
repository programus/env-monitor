import mysql from 'serverless-mysql'

export const db = mysql({
  config: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5506,
    database: process.env.DB_NAME || 'envrec',
    user: process.env.DB_USER || 'envrec',
    password: process.env.DB_PASSWORD || '3nvRec',
  },
})

export default {
  async query({query, values}) {
    const results = await db.query(query, values)
    await db.end()
    return results
  },
}
