SELECT
  createdAt,
  login,
  email,
  step,
  notifyAt
FROM user
WHERE login = ?
