const  urlPath = "/certificate";
const certificatePublicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0i7R4XsyG3m6KD36qKEVxE+odCh68W2O4vLqh6SnsgItzvLYvJKPai+jEkf22FlPn0QnGo+Znyi6dw1lhvg9FGXqodv33yrqKhGLkQPeURaMnJidxktK/3QLXuv9HiKq9fSDLJyPBJEFCCCiZNTGgWM0dqq43/XRi+7IX3gWU68U6v/7EyOW3U4ZgYUVlfwbUh6eKRan68/TObQua39oeUfDMhJa0NHnMXb1lq/vQIjEgGkOK5LLyz+X8ETUEhn8Qdx2SIORmftCPW4XO0UZmMHuGw9t+UUgniy5BL8kmvtjpVRWFUliJFGBTvBZCO6gcoX5eXi8LytCg+mJ6EDO+QIDAQAB\n-----END PUBLIC KEY-----\n";
const TIMEZONE = process.env.REACT_APP_TIMEZONE || "GMT";

module.exports = {
  urlPath,
  certificatePublicKey,
  TIMEZONE
}
