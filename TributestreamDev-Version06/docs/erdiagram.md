# Tributestream Data Model

This document outlines the entity-relationship diagram and data structure for the Tributestream application.

## ER Diagram

```mermaid
erDiagram
    USER ||--o{ TRIBUTE : owns
    USER ||--o{ FUNERAL_HOME : directs
    FUNERAL_HOME ||--o{ TRIBUTE : hosts
    PACKAGE ||--o{ TRIBUTE : "selected-for"
    TRIBUTE ||--o{ MEMORIAL_EVENT : "1‥3 events"
    USER {
        id PK
        username string
        email string
        password string
        contactInfo component
    }
    TRIBUTE {
        id PK
        slug UID
        lovedOnesFullName string
        lovedOnesDOB date
        dateOfPassing date
        priceTotal decimal
        paymentComplete boolean
    }
    FUNERAL_HOME {
        id PK
        name string
        address string
        city string
        state string
        zipCode string
        phone string
        website string
    }
    PACKAGE {
        id PK
        name string
        description text
        price decimal
        features array
    }
    MEMORIAL_EVENT {
        id PK
        title string
        description text
        eventType string
        startDate datetime
        endDate datetime
        location string
        city string
        state string
        zipCode string
    }
```

## Entity Descriptions

### User
The User entity represents users of the system, including tribute owners and funeral home directors.
- `id`: Unique identifier
- `username`: User's username for login
- `email`: User's email address
- `password`: Encrypted password
- `contactInfo`: Component containing contact information (phone, address, etc.)

### Tribute
The Tribute entity represents a memorial tribute for a loved one.
- `id`: Unique identifier
- `slug`: URL-friendly unique identifier
- `lovedOnesFullName`: Full name of the deceased
- `lovedOnesDOB`: Date of birth
- `dateOfPassing`: Date of passing
- `priceTotal`: Total price for the tribute services
- `paymentComplete`: Flag indicating if payment has been completed

### Funeral Home
The Funeral Home entity represents a funeral home business that hosts tributes.
- `id`: Unique identifier
- `name`: Name of the funeral home
- `address`: Street address
- `city`: City
- `state`: State/province
- `zipCode`: Postal/zip code
- `phone`: Contact phone number
- `website`: Website URL

### Package
The Package entity represents a service package that can be selected for a tribute.
- `id`: Unique identifier
- `name`: Package name
- `description`: Detailed description of package offerings
- `price`: Package price
- `features`: Array of features included in the package

### Memorial Event
The Memorial Event entity represents events related to a tribute, such as viewings, funeral services, or celebrations of life.
- `id`: Unique identifier
- `title`: Event title
- `description`: Event description
- `eventType`: Type of event (viewing, funeral, celebration of life)
- `startDate`: Start date and time
- `endDate`: End date and time
- `location`: Event location name
- `city`: City
- `state`: State/province
- `zipCode`: Postal/zip code

## Relationships

1. **User to Tribute (one-to-many)**
   - A user can own multiple tributes
   - Each tribute is owned by one user

2. **User to Funeral Home (one-to-many)**
   - A user can direct multiple funeral homes
   - Each funeral home has one director (user)

3. **Funeral Home to Tribute (one-to-many)**
   - A funeral home can host multiple tributes
   - Each tribute is hosted by one funeral home

4. **Package to Tribute (one-to-many)**
   - A package can be selected for multiple tributes
   - Each tribute can have one selected package

5. **Tribute to Memorial Event (one-to-many)**
   - A tribute can have multiple memorial events (typically 1-3)
   - Each memorial event belongs to one tribute

## Strapi Implementation Notes

In the Strapi CMS implementation:

1. Each entity is implemented as a Content Type
2. Relationships are implemented as relations between Content Types
3. The User entity is extended from Strapi's built-in Users & Permissions plugin
4. ContactInfo is implemented as a reusable component

The API services in the SvelteKit frontend are designed to interact with these Strapi Content Types through RESTful API endpoints.