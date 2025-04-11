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
Right now if an email address is already registered, or if we already have a loved one's tribute slug in the ssytem two things should happen. for the email part, we shoudl modify the email we send the family, as in not include the link. If the email is not registeres the the slug is already registred, then we add an iteratiive number _1 at the end, or _2 as needed, but not in the header of the file. 

Now how would we break this down?
-- Our form submits to a Wordpress API endpoint that registeres users and then is supoosed to register a tribute.  If the email is already registered, we still want to send an email to the family and show a positive submission message in the UI. It would be an email template that does not include the "custom URL".