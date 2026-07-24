CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(160) NOT NULL DEFAULT 'New conversation',
	`language` enum('en','fr','es','ar','pt') NOT NULL DEFAULT 'en',
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_message_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` enum('helpful','unhelpful') NOT NULL,
	`comment` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_message_feedback_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_feedback_message_user_idx` UNIQUE(`messageId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`responseData` json,
	`model` varchar(128),
	`inputTokens` int,
	`outputTokens` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`adminId` int,
	`mode` enum('portfolio','support','compliance') NOT NULL,
	`model` varchar(128) NOT NULL,
	`providerRequestId` varchar(128),
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`latencyMs` int NOT NULL,
	`status` enum('success','refused','error') NOT NULL,
	`safetyFlags` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ai_conversation_user_status_idx` ON `ai_conversations` (`userId`,`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `ai_message_conversation_idx` ON `ai_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_usage_user_created_idx` ON `ai_usage_logs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_usage_mode_created_idx` ON `ai_usage_logs` (`mode`,`createdAt`);