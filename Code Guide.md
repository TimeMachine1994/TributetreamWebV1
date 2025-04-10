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