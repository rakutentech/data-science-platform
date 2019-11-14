const request = require('request');
const log4js = require('log4js');

const Log4js = require('log4js');
Log4js.configure(require('../config/log-config.json'));

const logger = log4js.getLogger();

const buildProxyHeaders = (headers) =>{
  const proxyHeaders = Object.assign({}, headers)
  delete proxyHeaders['content-length'] // Avoid client hangs
  return proxyHeaders
}

export const forwardRequest = (url, req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  logger.info(`Forward ${req.method} ${fullUrl} to ${url} from [${ip}]`)
  const stream = request({
    url: url,
    headers: buildProxyHeaders(req.headers),
    body: JSON.stringify(req.body),
    method: req.method,
  })
  stream.on('error', function(e){
    logger.error(e)}
  );
  stream.pipe(res)
}
