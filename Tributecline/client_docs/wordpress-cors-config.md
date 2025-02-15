# WordPress CORS Configuration

To resolve the CORS issues between WordPress and the SvelteKit development server, please add the following configurations:

## 1. Add to wp-config.php

Add these lines to your WordPress wp-config.php file (before the "/* That's all, stop editing! */" line):

```php
# JWT Auth CORS Configuration
define('JWT_AUTH_CORS_ENABLE', true);
define('JWT_AUTH_CORS_ALLOW_ORIGIN', 'http://localhost:5173');
```

## 2. Add to .htaccess

Add these lines to your WordPress .htaccess file:

```apache
# BEGIN CORS Headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "http://localhost:5173"
    Header set Access-Control-Allow-Methods "POST, GET, OPTIONS, PUT, DELETE"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials true
</IfModule>
# END CORS Headers
```

## 3. Enable Apache Headers Module

Run these commands to enable the headers module and restart Apache:

```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

After making these changes:
1. Clear your browser cache
2. Reload your SvelteKit application
3. Try the login request again

The CORS error should be resolved after implementing these configurations.