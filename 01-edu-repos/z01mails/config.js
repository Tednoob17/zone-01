export const z01Credentials = {
  domain: process.env.DOMAIN || 'dev.01-edu.org',
  access_token: process.env.Z01_TOKEN || 'eb9952902ce482125a12da0ad88782473428aec1',
}

export const sender = '"Zone01 Rouen" <noreply@zone01normandie.org>'
export const nodemailerConfig = {
  host: 'smtp.office365.com',
  port: 587,
  tls: { ciphers: 'SSLv3' },
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
}
