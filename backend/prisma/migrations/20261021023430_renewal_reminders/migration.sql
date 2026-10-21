-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "emailSentAt" TIMESTAMP(3),
ADD COLUMN     "inApp" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inAppNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "renewalReminderDays" INTEGER[] DEFAULT ARRAY[7, 3, 1, 0]::INTEGER[];
