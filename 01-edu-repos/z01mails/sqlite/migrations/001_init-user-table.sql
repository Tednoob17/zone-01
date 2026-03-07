CREATE TABLE user (
  -- external, imported from zone01normandie.org
  createdAt  int NOT NULL,
  login      text NOT NULL PRIMARY KEY,
  email      text NOT NULL,

  -- current step of the student onboarding
  step       text,

  -- store last notification time
  notifyAt   int
);
