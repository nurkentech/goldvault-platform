ALTER TABLE `admin_credentials` ADD `totpSecret` varchar(256);--> statement-breakpoint
ALTER TABLE `admin_credentials` ADD `totpEnabled` boolean DEFAULT false NOT NULL;