# Tributestream Plugin Upgrade Instructions

Follow these steps to upgrade the Tributestream WordPress plugin:

1. **Backup Your Database**
   ```sql
   -- If you have existing tributes data, backup the table:
   mysqldump -u [user] -p [database_name] wp_tributes > tributes_backup.sql
   ```

2. **Deactivate Current Plugin**
   - Go to WordPress Admin Dashboard
   - Navigate to Plugins
   - Deactivate "Tributestream API"

3. **Replace Plugin File**
   - Rename current `unified-tributestream-plugin.php` to `unified-tributestream-plugin.php.bak`
   - Copy `tributestream-plugin-fixed.php` to the plugins directory
   - Rename it to `unified-tributestream-plugin.php`

4. **Reactivate Plugin**
   - Go back to WordPress Admin Dashboard > Plugins
   - Activate "Tributestream API"
   - This will automatically create the required database table

5. **Verify Installation**
   ```sql
   -- Check if the tributes table was created:
   DESCRIBE wp_tributes;
   
   -- Should show:
   -- id, user_id, loved_one_name, slug, created_at, updated_at
   ```

6. **Test Endpoints**
   - Test the tribute creation endpoint:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"user_id": 1, "loved_one_name": "Test Name", "slug": "test-name"}' \
     https://your-wordpress-site.com/wp-json/tributestream/v1/tribute
   ```

## Key Changes in This Update

1. Added proper database table creation
2. Fixed duplicate function definitions
3. Added better error handling
4. Added slug uniqueness validation
5. Improved logging for debugging

## Troubleshooting

If you encounter any issues:

1. Check WordPress debug log for errors:
   ```php
   // Add to wp-config.php:
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

2. Verify JWT plugin is working:
   ```bash
   # Test JWT token generation
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"username": "your_user", "password": "your_pass"}' \
     https://your-wordpress-site.com/wp-json/jwt-auth/v1/token
   ```

3. Check table creation:
   ```sql
   SHOW TABLES LIKE '%tributes%';
   ```

For any issues, check the WordPress debug log at `wp-content/debug.log`
