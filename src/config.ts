
const is_dev=process.env.NODE_ENV?.startsWith('dev');
const is_fisq=window.location.href.search(/festivalsalsaquebec/i)>=0;
const site=is_dev?''
            :(is_fisq?'festivalsalsaquebec.com':'quebecsensualweekend.com')

            export const config={
  TIMEZONE:'America/Montreal',
  
  SITE_CODE: is_dev || is_fisq? 'FISQ':'QSW',
  
  SITE_TITLE: is_dev || is_fisq
             ?'FISQ: Festival International de Salsa de Quebec'
             :'QSW: Quebec sensual weekend',

  SITE_EMAIL:'salsa_attitude@hotmail.com',

  MAX_FILE_SIZE:5*1024*1024,
  
  API:  is_dev?'https://dev.arsou.com/api'
              :`http://${site}.com/api`,

  IMG_URL: is_dev?'https://dev.arsou.com/data/imgs'
                 :`http://${site}/data/imgs`
}