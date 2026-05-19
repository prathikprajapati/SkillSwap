/*
  Warnings:

  - You are about to drop the column `session_id` on the `ratings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rated_user_id,rater_user_id,match_id]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/

-- DropForeignKey (must be dropped before dropping the index it depends on)
ALTER TABLE `ratings` DROP FOREIGN KEY `ratings_rated_user_id_fkey`;
ALTER TABLE `ratings` DROP FOREIGN KEY `ratings_rater_user_id_fkey`;

-- DropIndex (now safe to drop after foreign keys are removed)
DROP INDEX `ratings_rated_user_id_rater_user_id_session_id_key` ON `ratings`;

-- AlterTable
ALTER TABLE `matches` ADD COLUMN `status` ENUM('active', 'completed', 'cancelled', 'archived') NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `ratings` DROP COLUMN `session_id`,
    ADD COLUMN `match_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `achievements` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('FIRST_SKILL', 'SKILL_COLLECTOR', 'FIRST_MATCH', 'FIVE_CONNECTIONS', 'SOCIAL_BUTTERFLY', 'TEACHER', 'QUICK_LEARNER', 'STREAK_7', 'STREAK_30', 'TOP_RATED', 'SESSION_MASTER', 'VERIFIED', 'XP_1000') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `achievements_user_id_idx`(`user_id`),
    UNIQUE INDEX `achievements_user_id_type_key`(`user_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('MATCH_REQUEST', 'MATCH_ACCEPTED', 'NEW_MESSAGE', 'SESSION_REMINDER', 'ACHIEVEMENT_UNLOCKED', 'XP_EARNED', 'RATING_RECEIVED') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `data` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `matches_status_idx` ON `matches`(`status`);

-- CreateIndex
CREATE INDEX `matches_created_at_idx` ON `matches`(`created_at`);

-- CreateIndex
CREATE INDEX `ratings_rated_user_id_idx` ON `ratings`(`rated_user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `ratings_rated_user_id_rater_user_id_match_id_key` ON `ratings`(`rated_user_id`, `rater_user_id`, `match_id`);

-- CreateIndex
CREATE INDEX `users_created_at_idx` ON `users`(`created_at`);

-- CreateIndex
CREATE INDEX `users_is_deleted_idx` ON `users`(`is_deleted`);

-- AddForeignKey (add back the foreign keys with the new structure)
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ratings` ADD CONSTRAINT `ratings_rated_user_id_fkey` FOREIGN KEY (`rated_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ratings` ADD CONSTRAINT `ratings_rater_user_id_fkey` FOREIGN KEY (`rater_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
