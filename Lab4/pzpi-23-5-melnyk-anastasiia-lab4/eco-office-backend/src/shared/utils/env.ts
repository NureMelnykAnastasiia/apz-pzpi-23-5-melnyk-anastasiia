import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
};

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}