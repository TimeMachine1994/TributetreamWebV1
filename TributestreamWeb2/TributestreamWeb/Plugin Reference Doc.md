**Plugin Reference for Programmer**

---

### **Overview**

The **A6 Tributestream** plugin uses:
- A custom database table (`{prefix}_tributes`) to store tribute data.
- The default `wp_usermeta` table for user metadata.
- JWT authentication for protecting specific endpoints.

The plugin defines several REST API endpoints under the namespace: `/wp-json/tributestream/v1/`.

---

### **Endpoint Reference**

#### **1. Tribute Endpoints (Custom Table)**

1. **Get All Tributes**
   - **Route**: `GET /tributes`
   - **Description**: Retrieves all tributes with pagination and optional search.
   - **Authentication**: Public.
   - **Parameters**:
     - `page` (default: 1): Page number.
     - `per_page` (default: 10): Number of tributes per page.
     - `search` (optional): Search term for tribute titles/descriptions.

2. **Create Tribute**
   - **Route**: `POST /tributes`
   - **Description**: Adds a new tribute to the custom database table.
   - **Authentication**: Public.
   - **Required Fields**:
     - `user_id` (integer): ID of the user creating the tribute.
     - `loved_one_name` (string): Tributee’s name.
     - `slug` (string): Unique identifier for the tribute.
     - `phone_number` (string): Contact number.
   - **Optional Fields**:
     - `custom_html` (string): HTML content for the tribute.
     - `number_of_streams` (integer): Number of streams purchased.

3. **Get Tribute by ID**
   - **Route**: `GET /tributes/<id>`
   - **Description**: Retrieves a specific tribute by its ID.
   - **Authentication**: Public.

4. **Update Tribute by ID**
   - **Route**: `PUT /tributes/<id>`
   - **Description**: Updates a tribute record.
   - **Authentication**: Public.
   - **Optional Fields**:
     - `loved_one_name`, `slug`, `custom_html`, `phone_number`, `number_of_streams`.

5. **Delete Tribute by ID**
   - **Route**: `DELETE /tributes/<id>`
   - **Description**: Deletes a specific tribute by its ID.
   - **Authentication**: Public.

---

#### **2. User Meta Endpoints (WordPress `wp_usermeta` Table)**

1. **Create/Update User Meta**
   - **Route**: `POST /user-meta`
   - **Description**: Creates or updates a key-value pair in the `wp_usermeta` table.
   - **Authentication**: Requires JWT.
   - **Required Fields**:
     - `user_id` (integer): ID of the user.
     - `meta_key` (string): Key for the meta field.
     - `meta_value` (string): Value for the meta field.

2. **Get All User Meta**
   - **Route**: `GET /user-meta/<user_id>`
   - **Description**: Retrieves all meta fields for a specific user.
   - **Authentication**: Requires JWT.

---

#### **3. Registration Endpoint**

1. **Register User**
   - **Route**: `POST /register`
   - **Description**: Registers a new WordPress user and optionally sets custom user meta fields. Sends a welcome email.
   - **Authentication**: Public.
   - **Required Fields**:
     - `username` (string): WordPress username.
     - `email` (string): User’s email.
     - `password` (string): User’s password.
   - **Optional Fields**:
     - `meta` (array): Custom user metadata (e.g., `full_name`, `phone`).

---

### **JWT Authentication Details**

- **Usage**: Protects specific endpoints by requiring a valid JWT token in the `Authorization` header (`Bearer <token>`).
- **Validation Endpoint**: `/jwt-auth/v1/token/validate`.
- **Permission Callbacks**:
  - `verify_jwt_cookie`: Validates the token.
  - `custom_jwt_authenticate`: Custom callback for authentication.

---

### **Database Structure**

#### **Custom Table: `{prefix}_tributes`**
| Column            | Type         | Description                          |
|-------------------|--------------|--------------------------------------|
| `id`              | INT (PK)     | Auto-incrementing primary key.       |
| `user_id`         | INT          | References the user creating tribute.|
| `loved_one_name`  | VARCHAR(255) | Name of the tributee.                |
| `slug`            | VARCHAR(255) | Unique identifier for the tribute.   |
| `custom_html`     | TEXT         | HTML content for tribute.            |
| `phone_number`    | VARCHAR(20)  | Contact number.                      |
| `number_of_streams`| INT         | Purchased streams.                   |
| `created_at`      | DATETIME     | Record creation timestamp.           |
| `updated_at`      | DATETIME     | Last updated timestamp.              |

---

