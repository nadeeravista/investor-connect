import jwt from 'jsonwebtoken';

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_jwt_secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
};

// Generate Access Token (short-lived)
export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry,
  });
};

// Generate Refresh Token (long-lived)
export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenExpiry,
  });
};

// Verify the Access Token
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

// Verify the Refresh Token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};
