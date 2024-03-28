-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "displayName" TEXT,
    "bio" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpire" DATETIME
);

-- CreateTable
CREATE TABLE "ConnectedAccount" (
    "connectedAccount_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "type" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "createdAt" DATETIME,
    "expiresAt" DATETIME,
    "account_id" TEXT,
    CONSTRAINT "ConnectedAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "NewsletterSubscriberSends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriber_email" TEXT,
    "post_id" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterSubscriberSends_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "NewsletterSubscriberSends_subscriber_email_fkey" FOREIGN KEY ("subscriber_email") REFERENCES "Subscriber" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthAccessToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "access_token" TEXT NOT NULL,
    "user_id" INTEGER,
    "client_id" TEXT,
    CONSTRAINT "OAuthAccessToken_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "OAuthApp" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OAuthAccessToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "OAuthAccessTokenScope" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT,
    "accessToken_ID" INTEGER,
    CONSTRAINT "OAuthAccessTokenScope_accessToken_ID_fkey" FOREIGN KEY ("accessToken_ID") REFERENCES "OAuthAccessToken" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "OAuthAccessTokenScope_scope_fkey" FOREIGN KEY ("scope") REFERENCES "OAuthScope" ("scope") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthApp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "app_name" TEXT NOT NULL,
    "app_icon_url" TEXT,
    "app_homepage_url" TEXT,
    "app_description" TEXT
);

-- CreateTable
CREATE TABLE "OAuthAuthorizationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "user_id" INTEGER,
    "client_id" TEXT,
    CONSTRAINT "OAuthAuthorizationCode_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "OAuthApp" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OAuthAuthorizationCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "OAuthAuthorizationScope" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT,
    "authorizationScope_id" INTEGER,
    CONSTRAINT "OAuthAuthorizationScope_authorizationScope_id_fkey" FOREIGN KEY ("authorizationScope_id") REFERENCES "OAuthAuthorizationCode" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "OAuthAuthorizationScope_scope_fkey" FOREIGN KEY ("scope") REFERENCES "OAuthScope" ("scope") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthCallbackURL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "callback_url" TEXT NOT NULL,
    "oauthAppId" INTEGER,
    CONSTRAINT "OAuthCallbackURL_oauthAppId_fkey" FOREIGN KEY ("oauthAppId") REFERENCES "OAuthApp" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "OAuthDeviceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "device_code" TEXT NOT NULL,
    "user_code" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "client_id" TEXT,
    "access_token" TEXT,
    CONSTRAINT "OAuthDeviceRequest_access_token_fkey" FOREIGN KEY ("access_token") REFERENCES "OAuthAccessToken" ("access_token") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "OAuthDeviceRequest_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "OAuthApp" ("client_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthDeviceRequestScope" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT,
    "deviceRequest_id" INTEGER,
    CONSTRAINT "OAuthDeviceRequestScope_deviceRequest_id_fkey" FOREIGN KEY ("deviceRequest_id") REFERENCES "OAuthDeviceRequest" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "OAuthDeviceRequestScope_scope_fkey" FOREIGN KEY ("scope") REFERENCES "OAuthScope" ("scope") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthScope" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scope" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "post_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "publishDate" DATETIME DEFAULT CURRENT_DATE,
    "featuredImageUrl" TEXT,
    "body" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "excerpt" TEXT,
    "newsletterDate" DATETIME,
    "newsletterSent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostSubscriberTag" (
    "post_subscriber_tag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER,
    "subscriber_tag_id" INTEGER,
    CONSTRAINT "PostSubscriberTag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "PostSubscriberTag_subscriber_tag_id_fkey" FOREIGN KEY ("subscriber_tag_id") REFERENCES "SubscriberTag" ("subscriberTag_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PostTag" (
    "post_tag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER,
    "tag_id" INTEGER,
    CONSTRAINT "PostTag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "PostTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag" ("tag_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "subscriber_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubscriberEmailOpen" (
    "subscriber_email_open_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriber_id" INTEGER,
    "opened_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "broadcast_id" INTEGER,
    CONSTRAINT "SubscriberEmailOpen_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "Post" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "SubscriberEmailOpen_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "Subscriber" ("subscriber_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "SubscriberTag" (
    "subscriberTag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SubscriberTagLookup" (
    "subscriber_tag_lookup_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriber_id" INTEGER,
    "subscriber_tag_id" INTEGER,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriberTagLookup_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "Subscriber" ("subscriber_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "SubscriberTagLookup_subscriber_tag_id_fkey" FOREIGN KEY ("subscriber_tag_id") REFERENCES "SubscriberTag" ("subscriberTag_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Tag" (
    "tag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userRole_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "role_id" INTEGER,
    CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role" ("role_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "CoreLayout" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "name" TEXT,
    "layout_json" TEXT DEFAULT '{"global":{"splitterSize":1,"splitterExtra":4,"tabEnableFloat":true,"tabSetEnableClose":true,"tabSetMinWidth":100,"tabSetMinHeight":100,"borderMinSize":100,"borderEnableAutoHide":true,"enableEdgeDock":true},"borders":[{"type":"border","location":"bottom","children":[]},{"type":"border","location":"left","children":[]},{"type":"border","location":"right","children":[]}],"layout":{"type":"row","children":[]}}',
    "deleted" BOOLEAN DEFAULT false,
    CONSTRAINT "CoreLayout_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccessToken_access_token_key" ON "OAuthAccessToken"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "OauthApp_client_id_key" ON "OAuthApp"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAuthorizationCode_code_key" ON "OAuthAuthorizationCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthScopes_scope_key" ON "OAuthScope"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriberTag_tag_key" ON "SubscriberTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_key" ON "Tag"("tag");
