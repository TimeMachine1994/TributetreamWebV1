Home Page contains the FD Form.

The FD form is a form for the funeral directors to fill out.
We are importing enhance, ActionsResult, and PageData(which is currently not being used).
All of these are from SvelteKit 5.

ActionResult encapsulates the result of a POST form action.

Insde of our +page.svelte file for our /fd-form is the following:
Import statements as noted above.

A definition for additional types for registration status.
interface FormActionResult extends ActionResult{
    ???
}
We get the error "An interface can only extend an object type or intersection of object types with statically known members.

The solution, is not to try and extedn teh ActionResult.

Now, we have an interface called FormActionResult, with the types:
Success, Failure, Redirect, and Error. 

Question: I'm not quite sure where these types come into play. Where do we use them? I was under the impression this form action result was to help with deciding what to do, if say, there is a duplicate user and trying to register an email address and the registration fails. we still want to send an email to the family member. I'm not sure why and what purpose if any this form action result has for helping with this task. 

Answer:FormActionResult interface is used to type the form response in the enhance function, the progressive enhancmeent sveltekit thing. We have a "processServerErrors" function that handles the form sujbmission results including checking for errors and registration status. 

The form handlling code in the enhance funciton shwos how different result types are handled:
use:enhance={() => {

return async({ result, update}) => {
    // Cast the ActionResult to our FOrmActionResult type
    const formResult = result as unkonwn as FormActionResult;
    if (formResult.type === 'failure') {
        processServerErrors(formResult.data);
        isSubmiting = false;
    }
}

It seems that the most important part about the FormActionResult interface is that when the processServerErros function, handles both errors and success cases, inclduing the specific registrationStatus property:
check for registration status:
if(result?registrationStatus) {
    registrationStat = result.registrationStatus;
}

## Next Part
It seems that we should handle the usecases when filling out the form, to be sure that no matter what the user gets an email.
Right now if an email address is already registered, or if we already have a loved one's tribute slug in the ssytem two things should happen. 

for the email part, we shoudl modify the email we send the family, as in not include the link. If the email is not registeres the the slug is already registred, then we add an iteratiive number _1 at the end, or _2 as needed, but not in the header of the file. 

Now how would we break this down?
-- Our form submits to a Wordpress API endpoint that registeres users and then is supoosed to register a tribute.  If the email is already registered, we still want to send an email to the family and show a positive submission message in the UI. It would be an email template that does not include the "custom URL".

## How Does Send Email Work?
Send Email works by using the email-service to setup and compose the emails. In order to send an email if there is no successfully registration / creation of a tribute link we just bypass that error and continue with the email sending. But, the issue is, there is a link button that is sent to theuser when the link will not work.

It seems, we have four options available to to pick from when registering a user, either Success, Failure, Redirect, or Error, as a FormActionResult. 

Where does each value get set, and what needs to be? I'm assumign an error is different from a failure, and a success proceeds a redirect. So, maybe, after a success (form submission) it we check if there is an eror redireting. (as in, there is an erro creating the link due to a duplicate user email). If so, we set the type to failure, and chose the email that does not include the custom link. If we get a "redirect" then 1) we  can redirect the user and 2) pick the email containig th elink, if we get an error becusae the email couldnt send, we should lget the user know there is a critical error and email us directly at Tributestream@tributestream.com, and we apologie for glitch.

## How Sending Emails Works
So, we end up using createCustomEmailTemplate function inside the email-service.  What happens when a form is submitted, we first attemp to register the user with wordpress. If it the email is already registered, it continues with the email process. This is handle in the send-email/+server.ts endpoint.

## What we need to do
We need to modify the sendCustomerConfirmation function to use a different templated based on whether the user is new or exisiting, and pass this info to the registration process(?)

## Understanding the /send-email endpoint
It seems like we import registerWordpressUser, from /wp-user-service first. Not sure why? We'll get to that later I guess. Looks like we use the registerWordpressUser, instead of the register endpoint. This explains why the wp-user-service needs to call the wordpess api directly...

## Where we are at with the two emails
We need to modify the sendCustomerConfirmation function to accept an additional paramter indicating if the user is new or existing. 

What does this paramter look like? Is it from the "FromActionResult" interface, or no? I dont' think so. 

*Answer: Add a boolean flag*
## To Modify the sendCustomerConfirmation function
- [] You need to add the boolean paramter to indicate if the user is new or existing. This is a new paramter for this specific function. 


## What is a function signature?
A *function signature*  is a way to describe the shape of a function: what parameters it takes, what types those paramters have, and what type of value the function returns.  As in, a conside way to describe how a function is called and what comes back.

## Understanding the function we are changing
    "    export async function sendCustomerConfirmation(to: string, data: CustomerEmailData): Promise<boolean> {    "

*export* - makes the function available for import in other files, so you can call sendCustomerConfirmation(...). from elsewhere in your SvelteKit app, such as a server route, action, or utility module. 

*sendCustomerConfirmation* - this is the function name, and indicates the functions' purpose. This is presumably for events like a signup, purchase, or similar. 

*to: string* - the email address to which the message should be sent.
*data: customerEmailData* - a custom TypeScript type/interface that presumably holds whatever information is needed to fillout the email. Such as customer ename, order details, link, etc.

*Promise<boolean>* - Since the function is *async* it returns a *Promise*. The *function signature* indicates that the function should eventually resolve to a boolean, (ie True, email sent, false, email not sent.)


## CURRENT ISSUE:
We seem to go into a loop when trying to make this email thing work; so here it is what we are trying to do:
RIght now our Terminal is working to show that "Email already exists.. Form data still processed." BUT, what we want, is for an alternate email form to be sent. Right now, the issue is, After the registration fails, becasue the email already exists,.... we have the problem with it still saying is Exisitng User; false. it should say true. 

I need to seehow this is set and see why it is not being set correctly. 

# Discovered Flow:

1. wp-user-service.ts, we have a console log that attemps to register theuser, and shows that it did not work.
 It is here that we should set ourboolean flag. 

 So far it looks like it is setting "isDuplicate" to true, butit's reading isExistingUSer, which make sense why its reading false anyway. 

 # Possible Fix
 The log message matches the third condition of our if else statement inside of send-email api endpoint. 