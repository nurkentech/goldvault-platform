ALTER TABLE `users` ADD `kycStatus` enum('unverified','pending','verified','rejected') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifPrefs` json DEFAULT ('{"priceAlerts":true,"portfolioUpdates":true,"newsDigest":false,"securityAlerts":true,"marketingEmails":false}');--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(64);