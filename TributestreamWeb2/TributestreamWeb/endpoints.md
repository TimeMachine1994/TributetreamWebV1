# Tributestream API Endpoints

This document describes the custom endpoints provided by the **Tributestream API** plugin.  
They are registered under the namespace `tributestream/v1` in the WordPress REST API.

---

## Table of Contents

1. [Routes Overview](#routes-overview)
2. [Detailed Endpoints](#detailed-endpoints)
   1. [POST /tribute](#post-tributestreamv1tribute)
   2. [GET /tribute/{slug}](#get-tributestreamv1tributeslug)
   3. [POST /user-meta](#post-tributestreamv1user-meta)
   4. [GET /user-meta/{user_id}](#get-tributestreamv1user-metauser_id)
   5. [POST /register](#post-tributestreamv1register)
3. [Authentication](#authentication)
4. [Notes](#notes)

---

## Routes Overview

| Method | Endpoint                          | Callback Function                | Auth Required?          |
|--------|-----------------------------------|----------------------------------|-------------------------|
| POST   | /tribute                          | `handle_tributes_entry`          | Yes (JWT) via `verify_jwt_cookie` |
| GET    | /tribute/{slug}                  | `get_tribute_by_slug`            | No                      |
| POST   | /user-meta                       | `ts_store_user_meta`             | Yes (JWT) via `custom_jwt_authenticate` |
| GET    | /user-meta/{user_id}             | `ts_get_all_user_meta`           | Yes (JWT) via `custom_jwt_authenticate` |
| POST   | /register                        | `handle_tributestream_registration` | No                   |

---

## Detailed Endpoints

### POST `/tributestream/v1/tribute`

- **Callback:** `handle_tributes_entry`
- **Description:** Creates a new tribute entry in the custom `<prefix>_tributes` table.
- **Authentication:** Valid JWT required (Bearer token).
- **Expected JSON**:
  ```json
  {
    "user_id": 123,
    "loved_one_name": "Grandma",
    "slug": "my-grandma"
  }
