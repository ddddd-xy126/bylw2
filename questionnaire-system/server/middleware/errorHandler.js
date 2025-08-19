export default function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "服务器错误";
  res.status(status).json({ message });
}
