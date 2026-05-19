-- AlterTable - Add new columns without dropping existing unique constraint
ALTER TABLE `match_requests` ADD COLUMN `skill_offered_id` VARCHAR(191) NULL,
    ADD COLUMN `skill_wanted_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `exchanges` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `learner_id` VARCHAR(191) NOT NULL,
    `skill_id` VARCHAR(191) NOT NULL,
    `skill_name` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    INDEX `exchanges_match_id_idx`(`match_id`),
    INDEX `exchanges_teacher_id_idx`(`teacher_id`),
    INDEX `exchanges_learner_id_idx`(`learner_id`),
    INDEX `exchanges_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exchanges` ADD CONSTRAINT `exchanges_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
