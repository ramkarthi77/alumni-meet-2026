-- CreateTable: members
CREATE TABLE "members" (
    "phoneNumber"        VARCHAR(20)    NOT NULL,
    "name"               VARCHAR(200)   NOT NULL,
    "classBatch"         VARCHAR(100)   NOT NULL,
    "numberOfPeople"     INTEGER        NOT NULL,
    "contributionAmount" DECIMAL(10,2)  NOT NULL DEFAULT 0,
    "createdAt"          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    "updatedAt"          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT "members_pkey" PRIMARY KEY ("phoneNumber"),
    CONSTRAINT "members_numberOfPeople_check" CHECK ("numberOfPeople" > 0),
    CONSTRAINT "members_contributionAmount_check" CHECK ("contributionAmount" >= 0),
    CONSTRAINT "members_name_notempty" CHECK (LENGTH(TRIM("name")) > 0),
    CONSTRAINT "members_classBatch_notempty" CHECK (LENGTH(TRIM("classBatch")) > 0)
);

-- Indexes on members
CREATE INDEX "members_name_idx"        ON "members" ("name");
CREATE INDEX "members_classBatch_idx"  ON "members" ("classBatch");
CREATE INDEX "members_contributionAmount_idx" ON "members" ("contributionAmount");

-- CreateTable: organizers
CREATE TABLE "organizers" (
    "id"           TEXT           NOT NULL,
    "email"        VARCHAR(255)   NOT NULL,
    "name"         VARCHAR(200)   NOT NULL,
    "passwordHash" VARCHAR(255)   NOT NULL,
    "createdAt"    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    "lastLoginAt"  TIMESTAMPTZ,

    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizers_email_key" ON "organizers" ("email");

-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id"            TEXT           NOT NULL,
    "organizerId"   TEXT           NOT NULL,
    "action"        VARCHAR(50)    NOT NULL,
    "targetPhone"   VARCHAR(20)    NOT NULL,
    "changesBefore" JSONB,
    "changesAfter"  JSONB,
    "ipAddress"     VARCHAR(45),
    "createdAt"     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_targetPhone_idx"  ON "audit_logs" ("targetPhone");
CREATE INDEX "audit_logs_organizerId_idx"  ON "audit_logs" ("organizerId");

-- AddForeignKey: audit_logs.organizerId → organizers.id
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizerId_fkey"
    FOREIGN KEY ("organizerId") REFERENCES "organizers"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: audit_logs.targetPhone → members.phoneNumber
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_targetPhone_fkey"
    FOREIGN KEY ("targetPhone") REFERENCES "members"("phoneNumber")
    ON DELETE RESTRICT ON UPDATE CASCADE;
