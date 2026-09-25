PRAGMA foreign_keys = OFF;

CREATE TABLE "PostNew" (
    "post_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publishDate" DATETIME DEFAULT CURRENT_DATE,
    "featuredImageUrl" TEXT,
    "body" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "excerpt" TEXT,
    "newsletterDate" DATETIME,
    "newsletterSent" BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO PostNew SELECT post_id, publishDate, featuredImageUrl, body, title, slug, published, excerpt, newsletterDate, newsletterSent FROM Post;

DROP TABLE "UserRole";
DROP TABLE "ConnectedAccount";
DROP TABLE "Role";
DROP TABLE "User";
DROP TABLE "Post";

ALTER TABLE PostNew RENAME TO Post;

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "handle" TEXT,
  "displayName" TEXT,
  "bio" TEXT,
  "avatar" TEXT
);

CREATE TABLE "UserRole" (
    "user" TEXT,
    "role" TEXT,
    PRIMARY KEY (user, role)
);


INSERT INTO User VALUES ('did:plc:yltnuhmi5446q5gixfz277lu', 'ralexanderson.com', 'Alex', '', 'https://cdn.bsky.app/img/avatar/plain/did:plc:yltnuhmi5446q5gixfz277lu/bafkreidg4udaxb3vcz3cyqedqynrarxttwbwnnd65tngcplj6fo4eeum5i');
INSERT INTO UserRole VALUES ('did:plc:yltnuhmi5446q5gixfz277lu','admin');


PRAGMA foreign_keys = ON;