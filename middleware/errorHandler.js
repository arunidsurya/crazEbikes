const imgUri = process.env.IMGURI;
const images = {
  cover: 'resources/images/coverPhoto.jpg',
  logo: 'resources/images/logo.jpg',
  amazon: 'resources/images/amazon.jpg',
  dhl: 'resources/images/dhl.jpg',
  fedex: 'resources/images/fedex.jpg',
  gPay: 'resources/images/gPay.jpg',
  master: 'resources/images/master.jpg',
  visa: 'resources/images/visa.jpg',
};



function errorHandler(error, req, res, next) {
    error.statusCode=error.statusCode||500;
    error.status=error.status||'error';
    res.render('error',{error,images,imgUri});
    next();
}

module.exports = errorHandler;