CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` varchar(64) NOT NULL,
	`planName` varchar(128) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`currency` varchar(16) NOT NULL DEFAULT 'USD',
	`expectedRoi` decimal(5,2) NOT NULL,
	`duration` int NOT NULL,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`earnedProfit` decimal(20,8) NOT NULL DEFAULT '0',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kyc_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('passport','drivers_license','national_id') NOT NULL,
	`documentFrontUrl` text NOT NULL,
	`documentBackUrl` text,
	`selfieUrl` text NOT NULL,
	`proofOfAddressUrl` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `kyc_documents_id` PRIMARY KEY(`id`)
);
