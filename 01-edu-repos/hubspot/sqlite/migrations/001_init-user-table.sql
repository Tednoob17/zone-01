CREATE TABLE user (
  -- external, imported from zone01
  id        int NOT NULL PRIMARY KEY,
  login     text NOT NULL,
  email     text NOT NULL,

  -- current step of the student
  step      text,

  -- store last notification time
  updatedAt int
);
