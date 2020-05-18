module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://bmckenna:K33psq10@localhost/myfamily',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://bmckenna:K33psq10@localhost/myfamily_test',
  JWT_SECRET: process.env.JWT_SECRET || "this-secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "5m"
}