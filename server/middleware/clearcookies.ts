const clearCookies: Middleware = (_req, res, next) => {
  res.removeHeader('Set-Cookie');
  next();
};

export default clearCookies;
