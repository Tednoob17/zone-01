const {
  DOMAIN = 'dev.01-edu.org',
  Z01_TOKEN = 'a6b38ae9dc69c141ccd3b04bbb2d3091f2e2bbb4',
  HUBSPOT_TOKEN, // hubspot api access token
} = process.env

export const z01Credentials = { domain: DOMAIN, access_token: Z01_TOKEN }
export const hubSpotCredentials = { accessToken: HUBSPOT_TOKEN }
