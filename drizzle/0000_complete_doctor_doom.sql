CREATE TABLE `address_book` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(128) NOT NULL,
	`address` varchar(256) NOT NULL,
	`currency` varchar(16) NOT NULL DEFAULT 'BTC',
	`tag` enum('exchange','hardware_wallet','cold_storage','friend','business','other') NOT NULL DEFAULT 'other',
	`isFavorite` boolean NOT NULL DEFAULT false,
	`lastUsedAt` timestamp,
	`useCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `address_book_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`type` enum('daily','weekly','special') NOT NULL,
	`category` enum('trading','social','investment','streak','referral') NOT NULL,
	`reward` int NOT NULL,
	`target` int NOT NULL,
	`icon` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`content` text,
	`mediaUrl` text,
	`mediaType` enum('text','image','video','goldcoin') NOT NULL DEFAULT 'text',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `minting_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('micro','standard','premium','vault') NOT NULL,
	`weightGrams` decimal(10,3) NOT NULL,
	`goldCoinsUsed` int NOT NULL,
	`txHash` varchar(128),
	`status` enum('pending','processing','minted','delivered') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `minting_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nfc_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardNumber` varchar(19) NOT NULL,
	`cardholderName` varchar(128) NOT NULL,
	`expiryMonth` int NOT NULL,
	`expiryYear` int NOT NULL,
	`cardType` enum('virtual','physical') NOT NULL DEFAULT 'virtual',
	`isActive` boolean NOT NULL DEFAULT true,
	`isFrozen` boolean NOT NULL DEFAULT false,
	`dailyLimit` decimal(12,2) NOT NULL DEFAULT '1000.00',
	`monthlyLimit` decimal(12,2) NOT NULL DEFAULT '10000.00',
	`spentToday` decimal(12,2) NOT NULL DEFAULT '0.00',
	`spentThisMonth` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nfc_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('message','challenge','price_alert','social','minting','system','transaction') NOT NULL,
	`title` varchar(256) NOT NULL,
	`body` text NOT NULL,
	`icon` varchar(64),
	`actionUrl` varchar(256),
	`actionLabel` varchar(64),
	`isRead` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`asset` varchar(16) NOT NULL,
	`condition` enum('above','below') NOT NULL,
	`targetPrice` decimal(20,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`triggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text,
	`mediaUrl` text,
	`mediaType` enum('image','video','none') NOT NULL DEFAULT 'none',
	`platform` varchar(32),
	`likes` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`goldCoinsEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('send','receive','buy','sell','mint','nfc_payment','goldcoin_transfer','withdrawal','deposit') NOT NULL,
	`currency` varchar(16) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`fee` decimal(20,8) DEFAULT '0',
	`status` enum('pending','confirmed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`toAddress` varchar(256),
	`toUserId` int,
	`txHash` varchar(128),
	`network` varchar(32),
	`note` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`username` varchar(64),
	`email` varchar(320),
	`phone` varchar(32),
	`avatarUrl` text,
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`goldCoins` int NOT NULL DEFAULT 500,
	`tier` enum('bronze','silver','gold','platinum','diamond','legendary') NOT NULL DEFAULT 'bronze',
	`totalPoints` int NOT NULL DEFAULT 0,
	`leaderboardRank` int,
	`isOnline` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currency` varchar(16) NOT NULL,
	`balance` decimal(20,8) NOT NULL DEFAULT '0',
	`address` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
