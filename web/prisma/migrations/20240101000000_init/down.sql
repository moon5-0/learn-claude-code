-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Session_userId_idx";

-- DropIndex
DROP INDEX "Session_token_idx";

-- DropIndex
DROP INDEX "Session_token_key";

-- DropIndex
DROP INDEX "User_username_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_username_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "SessionStatus";
