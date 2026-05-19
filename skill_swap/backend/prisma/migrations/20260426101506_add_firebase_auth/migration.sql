/*
  Warnings:

  - A unique constraint covering the columns `[firebase_uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `firebase_uid` VARCHAR(191) NULL,
    MODIFY `password_hash` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `messages_match_id_created_at_idx` ON `messages`(`match_id`, `created_at`);

-- CreateIndex
CREATE UNIQUE INDEX `users_firebase_uid_key` ON `users`(`firebase_uid`);

-- RenameIndex
ALTER TABLE `match_requests` RENAME INDEX `match_requests_receiver_id_fkey` TO `match_requests_receiver_id_idx`;

-- RenameIndex
ALTER TABLE `matches` RENAME INDEX `matches_user2_id_fkey` TO `matches_user2_id_idx`;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `messages_sender_id_fkey` TO `messages_sender_id_idx`;
