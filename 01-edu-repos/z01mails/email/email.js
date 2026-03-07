import nodemailer from 'nodemailer'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { sender, nodemailerConfig } from '../config.js'

const transporter = nodemailer.createTransport(nodemailerConfig)

// templates dir
const rootDir = dirname(new URL(import.meta.url).pathname)

const templatesList = await readdir(join(rootDir, 'templates'))
const templatesEntries = templatesList.map(async name => {
  const html = await readFile(join(rootDir, 'templates', name), 'utf8')
  const sendTo = ({ subject, recievers }) =>
    transporter.sendMail({
      from: sender, // sender address
      bcc: recievers, // list of receivers
      subject, // Subject line
      html, // html body
      // text: ' ', // TODO: strip html tags and generate text from template
    })
  return [name.slice(0, -'.html'.length), sendTo]
})

export default Object.fromEntries(await Promise.all(templatesEntries))
