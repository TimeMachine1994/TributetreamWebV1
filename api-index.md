# TributeStream API Documentation

## Data Models

### 🛍️ Add-On
Optional add-on services or features.

**Fields:**
- `addOnTitle` (string): Name of the add-on
- `addOnDescription` (text): Detailed description
- `addOnPrice` (decimal): Cost of the add-on
- `addOnSlug` (string): URL-friendly identifier

### � Package
A service package that can be purchased for a tribute.

**Fields:**
- `title` (string): Name of the package
- `slug` (string): URL-friendly identifier
- `basePrice` (decimal): Base cost of the package
- `description` (text): Detailed package description

### 🏛️ Funeral Home
An organization that provides funeral services.

**Fields:**
- `Name` (string): Name of the funeral home
- `Address` (string): Physical location
- `users_permissions_users` (relation): Associated staff members (one-to-many)

### 🕯️ Tribute
A memorial page for a loved one.

**Fields:**
- `lovedOnesFullName` (string): Full name of the deceased
- `lovedOnesDOB` (date): Date of birth
- `lovedOnesDOD` (date): Date of death
- `slug` (uid): URL-friendly identifier (generated from full name)
- `paymentComplete` (boolean): Payment status
- `customHTML` (text): Custom HTML content
- `events` (component, repeatable): List of memorial events

**Relations:**
- `users_permissions_user` (one-to-one): Primary user/owner
- `users_permissions_users` (one-to-many): Associated users
- `funeral_home` (one-to-one): Associated funeral home
- `package` (one-to-one): Selected service package

### Components

#### 📅 Memorial Event
Event details component used within tributes.

**Fields:**
- `eventName` (string): Name of the event
- `locationName` (string): Venue name
- `locationAddress` (string): Venue address
- `startTime` (time): Event start time
- `endTime` (time): Event end time
- `startDate` (date): Event date
- `durationMinutes` (integer): Event duration

#### 📞 Contact Info
Contact information component.

**Fields:**
- `fullName` (string, required): Contact person's name
- `phoneNumber` (string, required): Phone number with validation

## API Endpoints

Each model has standard REST endpoints:

### Add-On Endpoints
- `GET /api/add-ons`: List all add-ons
- `GET /api/add-ons/:id`: Get specific add-on
- `POST /api/add-ons`: Create add-on
- `PUT /api/add-ons/:id`: Update add-on
- `DELETE /api/add-ons/:id`: Delete add-on

### Package Endpoints
- `GET /api/packages`: List all packages
- `GET /api/packages/:id`: Get specific package
- `POST /api/packages`: Create package
- `PUT /api/packages/:id`: Update package
- `DELETE /api/packages/:id`: Delete package

### Funeral Home Endpoints
- `GET /api/funeral-homes`: List all funeral homes
- `GET /api/funeral-homes/:id`: Get specific funeral home
- `POST /api/funeral-homes`: Create funeral home
- `PUT /api/funeral-homes/:id`: Update funeral home
- `DELETE /api/funeral-homes/:id`: Delete funeral home

### Tribute Endpoints
- `GET /api/tributes`: List all tributes
- `GET /api/tributes/:id`: Get specific tribute
- `POST /api/tributes`: Create tribute
- `PUT /api/tributes/:id`: Update tribute
- `DELETE /api/tributes/:id`: Delete tribute

## Data Flow

1. Funeral homes are created with associated staff users
2. Service packages are defined with pricing and features
3. When a tribute is created:
   - It's associated with a funeral home
   - A service package is selected
   - Memorial events are added
   - Custom content can be added via HTML
   - Multiple users can be associated for collaboration
## Notes

- Add-ons have draft/publish functionality enabled

- Tributes have draft/publish functionality enabled
- Funeral homes have draft/publish functionality enabled
- Packages do not have draft/publish functionality
- Phone numbers must match the pattern: `^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$`