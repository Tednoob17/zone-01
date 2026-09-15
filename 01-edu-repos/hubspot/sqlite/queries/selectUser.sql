SELECT
  id,
  login,
  email,
  step,
  updatedAt
FROM user
WHERE id = ?
