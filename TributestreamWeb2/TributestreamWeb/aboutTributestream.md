# Cleaned-Up Transcript

We are creating a website called **tributestream.com**. It is a platform for users to livestream funerals and celebrations of life. Below is an overview of the technology stack and the functionality we aim to implement.

## Tech Stack

1. **Front End**  
   - **SvelteKit 5**  
   - **Tailwind CSS**  
   - Hosted on **Vercel**  

2. **Back End**  
   - **WordPress** on a virtual private server  
   - Provides access to **MySQL** and user authentication  
   - Exposes REST endpoints  
   - Includes a custom WordPress plugin that adds additional API endpoints  
     for our SvelteKit application to consume

## Custom WordPress Plugin

- We rely on a **custom WordPress plugin** that exposes certain endpoints.  
- These endpoints allow us to write/read data (e.g., user meta, custom data) via the WordPress REST interface.  
## Website Structure and Flow

The website has three main parts:

1. **Header**  
   - Contains navigation links  
   - Includes a "My Portal" button that leads to a login page  
   - The login page has a login form and a register button

2. **Main Body (Home Page)**  
   - Features a form where a user can enter the name of a loved one  
   - Includes two buttons: **Create** and **Search**

   ### Search  
   - Clicking **Search** leads to a page that pulls a list of names from the database.  
   - (We may still need to write this endpoint if it doesn’t exist yet.)

   ### Create  
   - Clicking **Create** activates a second form on the same page.  
   - Submitting this form should:
     1. Register a new user (if not already logged in)  
     2. Log the user in and store a session cookie  
     3. Create a new tribute entry in the WordPress database (using the user’s data)  
     4. Save necessary meta data to user meta or a tributes table  
     5. Redirect the user to the newly created page. This page’s URL is derived from a **slug** of the loved one’s name.


