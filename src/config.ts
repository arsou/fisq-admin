export const config={
  TIMEZONE:'America/Montreal',
  SITE_CODE:'FISQ',
  SITE_TITLE: 'FISQ:Festival International de Salsa de Quebec',
  SITE_EMAIL:'salsa_attitude@hotmail.com',
  MAX_FILE_SIZE:5*1024*1024,
  
  API:process.env.NODE_ENV?.startsWith('dev')
      ?'https://dev.arsou.com/api'
      :'http://festivalsalsaquebec.com/api',

  IMG_URL:process.env.NODE_ENV?.startsWith('dev')
      ?'https://dev.arsou.com/data/imgs'
      :'http://festivalsalsaquebec.com/data/imgs'
}