# Our Goal
So our goal is clear and simple.
We want to have a my-portal page, that let's a user login. The Login Button triggers a form action called "submit." 
What w ewant to do, is take the form data and use it to login using our /auth api endpoint, which should store a cookie in our hooks.server.ts file.

THis means we are authenticated. 

Now, before we re-direct the user, we need to know where to send them. So, with our authenticated user we should basically get wordpress to get all the data we can. We should get the user's role, and check if they are an "administrator" role and if so, shend them to a particular page, and if not, send all others to anothe rpage. 

How do we get the role? Well, as part of our response we can modify our wordpress plugin's auth endpoint to reurn the user role Thi might be better, and then we make receiprical changes in our api/auth endpoint. 