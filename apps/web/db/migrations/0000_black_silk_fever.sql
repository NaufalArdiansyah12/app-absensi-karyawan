CREATE TABLE `attendances` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`check_in_time` text NOT NULL,
	`check_in_lat` real NOT NULL,
	`check_in_lng` real NOT NULL,
	`check_in_distance_meters` real NOT NULL,
	`check_in_photo_key` text NOT NULL,
	`check_out_time` text,
	`check_out_lat` real,
	`check_out_lng` real,
	`check_out_photo_key` text,
	`status` text NOT NULL,
	`late_minutes` integer DEFAULT 0 NOT NULL,
	`overtime_minutes` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`details` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`duration_days` integer NOT NULL,
	`reason` text NOT NULL,
	`doc_key` text,
	`status` text DEFAULT 'MENUNGGU_GM' NOT NULL,
	`gm_note` text,
	`gm_approved_at` integer,
	`hr_note` text,
	`hr_approved_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `office_locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`radius_meters` integer DEFAULT 100 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payrolls` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`base_salary` integer NOT NULL,
	`allowance` integer DEFAULT 0 NOT NULL,
	`late_deduction` integer DEFAULT 0 NOT NULL,
	`absent_deduction` integer DEFAULT 0 NOT NULL,
	`overtime_pay` integer DEFAULT 0 NOT NULL,
	`tax_and_bpjs` integer DEFAULT 0 NOT NULL,
	`net_salary` integer NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`generated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`late_tolerance_minutes` integer DEFAULT 15 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nik` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`division` text NOT NULL,
	`job_position` text NOT NULL,
	`base_salary` integer DEFAULT 0 NOT NULL,
	`leave_quota` integer DEFAULT 12 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_nik_unique` ON `users` (`nik`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);