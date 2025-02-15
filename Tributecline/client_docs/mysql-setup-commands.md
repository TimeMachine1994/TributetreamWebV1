# MySQL Setup Commands

Last Updated: 2024-02-14

Copy and paste the following command block into your MySQL console to create all required tables:

```sql
-- Drop tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS `wp_tribute_meta`;
DROP TABLE IF EXISTS `wp_tribute_contents`;
DROP TABLE IF EXISTS `wp_tributes`;

-- Create main tributes table
CREATE TABLE `wp_tributes` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `loved_one_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `number_of_streams` int(11) DEFAULT 0,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slug` (`slug`),
  KEY `user_id` (`user_id`),
  KEY `status_deleted` (`status`, `deleted_at`),
  CONSTRAINT `fk_tribute_user` FOREIGN KEY (`user_id`) 
    REFERENCES `wp_users` (`ID`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tribute contents table
CREATE TABLE `wp_tribute_contents` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tribute_id` bigint(20) UNSIGNED NOT NULL,
  `content_type` enum('html','text','media') NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tribute_id` (`tribute_id`),
  CONSTRAINT `fk_content_tribute` FOREIGN KEY (`tribute_id`)
    REFERENCES `wp_tributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tribute metadata table
CREATE TABLE `wp_tribute_meta` (
  `meta_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tribute_id` bigint(20) UNSIGNED NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` longtext,
  PRIMARY KEY (`meta_id`),
  KEY `tribute_id` (`tribute_id`),
  KEY `meta_key` (`meta_key`),
  CONSTRAINT `fk_meta_tribute` FOREIGN KEY (`tribute_id`)
    REFERENCES `wp_tributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If you have existing data, migrate it with these commands:
INSERT INTO wp_tributes 
SELECT 
  id, 
  user_id, 
  loved_one_name, 
  slug, 
  created_at, 
  updated_at, 
  NULL as deleted_at, 
  phone_number, 
  COALESCE(number_of_streams, 0), 
  'published' as status
FROM wp_tributes_old;

INSERT INTO wp_tribute_contents (tribute_id, content_type, content, created_at, updated_at)
SELECT 
  id, 
  'html', 
  custom_html, 
  created_at, 
  updated_at
FROM wp_tributes_old
WHERE custom_html IS NOT NULL;
```

## Notes:

1. Replace `wp_` with your actual WordPress table prefix if different
2. Backup your database before running these commands
3. The migration commands assume your old table was named `wp_tributes_old`
4. These commands include foreign key constraints, so tables must be created in the correct order
5. All tables use utf8mb4 character set for full Unicode support
6. Indexes are created for commonly queried fields

## Features:

1. **wp_tributes**:
   - Soft delete support via `deleted_at`
   - Status management (draft/published/archived)
   - Foreign key to WordPress users table
   - Optimized indexes for common queries

2. **wp_tribute_contents**:
   - Separate content storage for better performance
   - Support for different content types
   - Cascading deletes with main tribute table

3. **wp_tribute_meta**:
   - Flexible metadata storage
   - Optimized for key-based queries
   - Cascading deletes with main tribute table

After running these commands, your database will be properly structured with all necessary relationships and optimizations in place.