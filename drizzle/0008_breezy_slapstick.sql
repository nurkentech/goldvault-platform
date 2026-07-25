CREATE TABLE `admin_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int,
	`adminUsername` varchar(64),
	`action` varchar(160) NOT NULL,
	`targetType` varchar(64),
	`targetId` varchar(128),
	`ipAddress` varchar(64) NOT NULL,
	`userAgent` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralId` int NOT NULL,
	`sourceTransactionId` int NOT NULL,
	`referrerId` int NOT NULL,
	`currency` varchar(16) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_commissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_commission_source_idx` UNIQUE(`sourceTransactionId`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`status` enum('signed_up','qualified','paid') NOT NULL DEFAULT 'signed_up',
	`totalCommission` decimal(20,8) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referred_user_idx` UNIQUE(`referredUserId`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`ipAddress` varchar(64) NOT NULL,
	`userAgent` varchar(512),
	`deviceLabel` varchar(160),
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_hash_idx` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `referredByUserId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredCurrency` enum('USD','EUR','GBP','NGN') DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referral_code_idx` UNIQUE(`referralCode`);--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_currency_idx` UNIQUE(`userId`,`currency`);--> statement-breakpoint
CREATE INDEX `audit_admin_created_idx` ON `admin_audit_logs` (`adminId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `audit_action_created_idx` ON `admin_audit_logs` (`action`,`createdAt`);--> statement-breakpoint
CREATE INDEX `referral_commission_referrer_idx` ON `referral_commissions` (`referrerId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `referrals_referrer_created_idx` ON `referrals` (`referrerId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `sessions_user_active_idx` ON `user_sessions` (`userId`,`revokedAt`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `user_sessions` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `investments_user_status_idx` ON `investments` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `investments_status_end_idx` ON `investments` (`status`,`endDate`);--> statement-breakpoint
CREATE INDEX `investments_created_at_idx` ON `investments` (`createdAt`);--> statement-breakpoint
CREATE INDEX `kyc_user_status_idx` ON `kyc_documents` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `kyc_status_submitted_idx` ON `kyc_documents` (`status`,`submittedAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`userId`,`isRead`);--> statement-breakpoint
CREATE INDEX `transactions_user_created_idx` ON `transactions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `transactions_status_created_idx` ON `transactions` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `transactions_type_status_idx` ON `transactions` (`type`,`status`);--> statement-breakpoint
CREATE INDEX `users_referred_by_idx` ON `users` (`referredByUserId`);--> statement-breakpoint
CREATE INDEX `users_created_at_idx` ON `users` (`createdAt`);