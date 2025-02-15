# Database Optimization Plan

Last Updated: 2024-02-14

## Current Structure Analysis

### wp_tributes Table (Current)
```sql
CREATE TABLE IF NOT EXISTS `{prefix}_tributes` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `loved_one_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `custom_html` text,
  `phone_number` varchar(50) NOT NULL,
  `number_of_streams` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `slug` (`slug`),
  UNIQUE KEY `unique_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Identified Issues
1. Missing foreign key constraint on user_id
2. No validation for phone_number format
3. Potential for data duplication in custom_html
4. No soft delete capability
5. Limited metadata flexibility

## Proposed Optimizations

### 1. Enhanced Tributes Table
```sql
CREATE TABLE IF NOT EXISTS `{prefix}_tributes` (
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
    REFERENCES `{prefix}_users` (`ID`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. New Tribute Content Table
```sql
CREATE TABLE IF NOT EXISTS `{prefix}_tribute_contents` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tribute_id` bigint(20) UNSIGNED NOT NULL,
  `content_type` enum('html','text','media') NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tribute_id` (`tribute_id`),
  CONSTRAINT `fk_content_tribute` FOREIGN KEY (`tribute_id`)
    REFERENCES `{prefix}_tributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Tribute Metadata Table
```sql
CREATE TABLE IF NOT EXISTS `{prefix}_tribute_meta` (
  `meta_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tribute_id` bigint(20) UNSIGNED NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` longtext,
  PRIMARY KEY (`meta_id`),
  KEY `tribute_id` (`tribute_id`),
  KEY `meta_key` (`meta_key`),
  CONSTRAINT `fk_meta_tribute` FOREIGN KEY (`tribute_id`)
    REFERENCES `{prefix}_tributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Benefits of New Structure

1. **Improved Data Integrity**
   - Foreign key constraints ensure referential integrity
   - Proper data type constraints
   - Enum types for status management

2. **Better Performance**
   - Optimized indexes for common queries
   - Separated content storage reduces main table size
   - Efficient metadata querying

3. **Enhanced Flexibility**
   - Soft delete support
   - Status management
   - Extensible metadata system
   - Separated content storage for better content management

4. **Scalability**
   - Reduced data duplication
   - Better query optimization possibilities
   - Easier backup and maintenance

## Migration Strategy

1. **Pre-Migration**
   - Backup existing database
   - Create new tables without dropping old ones
   - Verify foreign key relationships

2. **Data Migration**
   ```sql
   -- Step 1: Migrate core tribute data
   INSERT INTO new_{prefix}_tributes 
   SELECT id, user_id, loved_one_name, slug, created_at, updated_at, 
          NULL as deleted_at, phone_number, number_of_streams, 'published' as status
   FROM {prefix}_tributes;

   -- Step 2: Migrate custom HTML to content table
   INSERT INTO {prefix}_tribute_contents (tribute_id, content_type, content, created_at, updated_at)
   SELECT id, 'html', custom_html, created_at, updated_at
   FROM {prefix}_tributes
   WHERE custom_html IS NOT NULL;
   ```

3. **Post-Migration**
   - Verify data integrity
   - Update application code to use new structure
   - Create backup of old tables before removal

## Implementation Notes

1. **PHP Code Updates Required**
   - Update CRUD operations in WordpressPlugin.php
   - Modify queries to handle soft deletes
   - Add status management functionality
   - Implement content type handling

2. **API Considerations**
   - Maintain backward compatibility
   - Add new endpoints for enhanced features
   - Update documentation

3. **Performance Monitoring**
   - Add query logging for optimization
   - Monitor index usage
   - Track query performance

## Next Steps

1. Review and approve database structure changes
2. Create development environment for testing
3. Implement migration scripts
4. Update PHP code to support new structure
5. Test thoroughly before production deployment