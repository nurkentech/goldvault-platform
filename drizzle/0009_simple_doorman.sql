CREATE TABLE `affiliate_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`currency` varchar(16) NOT NULL DEFAULT 'USD',
	`status` enum('requested','approved','paid','rejected') NOT NULL DEFAULT 'requested',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `affiliate_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`parentAffiliateId` int,
	`commissionRate` decimal(5,2) NOT NULL DEFAULT '10',
	`totalEarned` decimal(20,8) NOT NULL DEFAULT '0',
	`payoutBalance` decimal(20,8) NOT NULL DEFAULT '0',
	`status` enum('pending','approved','suspended') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliate_user_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `aml_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionId` int,
	`rule` varchar(128) NOT NULL,
	`riskScore` int NOT NULL,
	`details` json,
	`status` enum('open','reviewing','cleared','reported') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `aml_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`keyPrefix` varchar(16) NOT NULL,
	`keyHash` varchar(64) NOT NULL,
	`scopes` json NOT NULL,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_key_hash_idx` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `blog_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	CONSTRAINT `blog_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_category_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorAdminId` int NOT NULL,
	`categoryId` int,
	`title` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`coverImageUrl` text,
	`seoTitle` varchar(256),
	`seoDescription` varchar(320),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `investment_agreements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` varchar(64) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`currency` varchar(16) NOT NULL,
	`termsVersion` varchar(32) NOT NULL,
	`documentHash` varchar(64) NOT NULL,
	`signatureName` varchar(128),
	`signedIp` varchar(64),
	`signedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investment_agreements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `p2p_disputes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`openedByUserId` int NOT NULL,
	`reason` text NOT NULL,
	`evidence` json,
	`status` enum('open','reviewing','resolved_buyer','resolved_seller') NOT NULL DEFAULT 'open',
	`resolution` text,
	`resolvedByAdminId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `p2p_disputes_id` PRIMARY KEY(`id`),
	CONSTRAINT `p2p_dispute_order_idx` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `p2p_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`senderId` int NOT NULL,
	`body` text NOT NULL,
	`attachmentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `p2p_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `p2p_offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`side` enum('buy','sell') NOT NULL,
	`asset` varchar(16) NOT NULL,
	`fiatCurrency` varchar(8) NOT NULL DEFAULT 'USD',
	`price` decimal(20,8) NOT NULL,
	`minAmount` decimal(20,8) NOT NULL,
	`maxAmount` decimal(20,8) NOT NULL,
	`availableAmount` decimal(20,8) NOT NULL,
	`paymentMethods` json NOT NULL,
	`terms` text,
	`status` enum('active','paused','closed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `p2p_offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `p2p_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`asset` varchar(16) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`fiatCurrency` varchar(8) NOT NULL,
	`fiatAmount` decimal(20,2) NOT NULL,
	`status` enum('escrowed','paid','released','cancelled','disputed','refunded') NOT NULL DEFAULT 'escrowed',
	`paymentReference` varchar(128),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `p2p_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`endpointHash` varchar(64) NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_endpoint_hash_idx` UNIQUE(`endpointHash`)
);
--> statement-breakpoint
CREATE TABLE `recurring_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('vault_transfer','deposit') NOT NULL,
	`vaultId` int,
	`currency` varchar(16) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`paymentMethodToken` varchar(256),
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`nextRunAt` timestamp NOT NULL,
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recurring_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_vaults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`currency` varchar(16) NOT NULL,
	`balance` decimal(20,8) NOT NULL DEFAULT '0',
	`targetAmount` decimal(20,8) NOT NULL,
	`lockUntil` timestamp,
	`status` enum('active','completed','closed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savings_vaults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staking_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`asset` varchar(16) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`apy` decimal(6,2) NOT NULL,
	`durationDays` int NOT NULL,
	`autoCompound` boolean NOT NULL DEFAULT false,
	`accruedYield` decimal(20,8) NOT NULL DEFAULT '0',
	`status` enum('active','completed','withdrawn_early') NOT NULL DEFAULT 'active',
	`startsAt` timestamp NOT NULL DEFAULT (now()),
	`unlocksAt` timestamp NOT NULL,
	`endedAt` timestamp,
	CONSTRAINT `staking_positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`senderUserId` int,
	`senderAdminId` int,
	`body` text NOT NULL,
	`attachmentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(256) NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'general',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('open','waiting_user','waiting_support','resolved','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suspicious_activity_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`filedByAdminId` int NOT NULL,
	`jurisdiction` varchar(64) NOT NULL,
	`narrative` text NOT NULL,
	`reference` varchar(128),
	`filedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suspicious_activity_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trusted_withdrawal_ips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ipAddress` varchar(64) NOT NULL,
	`label` varchar(128),
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trusted_withdrawal_ips_id` PRIMARY KEY(`id`),
	CONSTRAINT `trusted_ip_user_idx` UNIQUE(`userId`,`ipAddress`)
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`event` varchar(128) NOT NULL,
	`responseStatus` int,
	`attempts` int NOT NULL DEFAULT 0,
	`deliveredAt` timestamp,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_endpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`url` text NOT NULL,
	`secret` varchar(128) NOT NULL,
	`events` json NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_endpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `nfc_cards` ADD `issuanceStatus` enum('pending','issued','rejected') DEFAULT 'issued' NOT NULL;--> statement-breakpoint
ALTER TABLE `nfc_cards` ADD `pinHash` varchar(256);--> statement-breakpoint
ALTER TABLE `nfc_cards` ADD `spendDayKey` varchar(10);--> statement-breakpoint
ALTER TABLE `nfc_cards` ADD `spendMonthKey` varchar(7);--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `twoFactorVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','fr','es','ar','pt') DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `themePreference` enum('light','dark','system') DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totpSecret` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorBackupCodes` json;--> statement-breakpoint
ALTER TABLE `users` ADD `affiliateStatus` enum('none','pending','approved','suspended') DEFAULT 'none' NOT NULL;--> statement-breakpoint
CREATE INDEX `affiliate_payout_idx` ON `affiliate_payouts` (`affiliateId`,`requestedAt`);--> statement-breakpoint
CREATE INDEX `affiliate_parent_idx` ON `affiliate_profiles` (`parentAffiliateId`);--> statement-breakpoint
CREATE INDEX `aml_status_idx` ON `aml_alerts` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `aml_user_idx` ON `aml_alerts` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `api_key_user_idx` ON `api_keys` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `blog_status_published_idx` ON `blog_posts` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `agreement_user_plan_idx` ON `investment_agreements` (`userId`,`planId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `p2p_dispute_status_idx` ON `p2p_disputes` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `p2p_message_order_idx` ON `p2p_messages` (`orderId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `p2p_offer_market_idx` ON `p2p_offers` (`asset`,`side`,`status`);--> statement-breakpoint
CREATE INDEX `p2p_offer_user_idx` ON `p2p_offers` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `p2p_order_buyer_idx` ON `p2p_orders` (`buyerId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `p2p_order_seller_idx` ON `p2p_orders` (`sellerId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `p2p_order_status_idx` ON `p2p_orders` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `push_user_idx` ON `push_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `schedule_due_idx` ON `recurring_schedules` (`status`,`nextRunAt`);--> statement-breakpoint
CREATE INDEX `schedule_user_idx` ON `recurring_schedules` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `vault_user_status_idx` ON `savings_vaults` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `staking_user_status_idx` ON `staking_positions` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `staking_unlock_idx` ON `staking_positions` (`status`,`unlocksAt`);--> statement-breakpoint
CREATE INDEX `ticket_message_idx` ON `support_ticket_messages` (`ticketId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ticket_user_idx` ON `support_tickets` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ticket_status_idx` ON `support_tickets` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `sar_alert_idx` ON `suspicious_activity_reports` (`alertId`);--> statement-breakpoint
CREATE INDEX `webhook_delivery_idx` ON `webhook_deliveries` (`webhookId`,`createdAt`);