import nodemailer from 'nodemailer'

export default {
  send: async (message /* {subject, text} */) => {
    const email = {
      to: process.env.EMAIL_TO,
      from: process.env.EMAIL_FROM,
    }
    const ret = {
      email,
    }
    console.log(ret)
    if (email.from && email.to) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_SERVER,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SSL,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })
        const result = await transporter.sendMail({
          ...email,
          ...message,
        })
        ret.result = result
      } catch(error) {
        ret.error = error
      }
    }
    return ret
  }
}