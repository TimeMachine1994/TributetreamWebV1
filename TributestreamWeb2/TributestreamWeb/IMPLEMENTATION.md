 Form actions in SvelteKit 5 allow you to handle **POST** requests to the server using the `<form>` element. They can be progressively enhanced with JavaScript for a better user experience.

Here's a breakdown of how they work:

*   **Defining Actions:** Actions are defined within a `+page.server.js` file. A page can have a `default` action or multiple named actions.

    *   **Default Action:** A `default` action is executed when the `<form>` element doesn't specify a particular action.
        ```javascript
        export const actions = {
          default: async (event) => {
            // TODO: Handle form submission
          }
        };
        ```
    *   **Named Actions:**  A page can have multiple named actions.
        ```javascript
        export const actions = {
          login: async (event) => {
            // TODO: Handle login
          },
          register: async (event) => {
            // TODO: Handle registration
          }
        };
        ```
*   **Invoking Actions:** To invoke an action, you use the `<form>` element in your Svelte component.
    *   **Default Action:** To invoke the default action, just include a `<form>` element with `method="POST"`.
        ```html
        <form method="POST">
          <!-- Form inputs -->
          <button>Submit</button>
        </form>
        ```
    *   **Named Action:** To invoke a named action, add a query parameter to the `action` attribute of the `<form>` with the name prefixed by a `/` character.  Alternatively, the `formaction` attribute on a `<button>` can  POST form data to a different action than the parent `<form>`.
        ```html
        <form method="POST" action="?/register">
          <!-- Form inputs -->
        </form>

        <form method="POST" action="?/login">
          <!-- Form inputs -->
          <button>Log in</button>
          <button formaction="?/register">Register</button>
        </form>
        ```
*   **RequestEvent:** Each action receives a `RequestEvent` object, which you can use to read form data with `request.formData()`.
*   **Responses:** After processing the request, the action can respond with data that will be available through the `form` property on the corresponding page and through `page.form` app-wide until the next update.
*   **Validation Errors:** If the request couldn’t be processed due to invalid data, you can return validation errors using the `fail` function from `@sveltejs/kit`. This function lets you return an HTTP status code (typically 400 or 422) along with the data.
*   **Redirects:** The `redirect` function from `@sveltejs/kit` can be used to redirect users after a successful form submission.  Ensure the redirect isn't caught within a `try...catch` block.
*   **Progressive Enhancement:** The easiest way to progressively enhance a form is to add the `use:enhance` action to the `<form>` element.

    *   Without arguments, `use:enhance` emulates the browser-native behavior without full-page reloads.
    *   It updates the `form` property, `page.form`, and `page.status` on a successful or invalid response, but only if the action is on the same page you’re submitting from.  It also resets the `<form>` element, invalidates all data using `invalidateAll` on a successful response, calls `goto` on a redirect response, renders the nearest `+error` boundary if an error occurs, and resets focus to the appropriate element.
    *   You can customize the behavior by providing a `SubmitFunction` that runs immediately before the form is submitted and optionally returns a callback that runs with the `ActionResult`.  If you return a callback, the default behavior is not triggered, but you can call `update` to trigger it.
    *   `applyAction` can be used to reproduce part of the default `use:enhance` behavior without invalidating all data on a successful response.
*   **Custom Event Listener:** You can implement progressive enhancement yourself with a normal event listener on the `<form>`. The response from the server needs to be deserialized using `deserialize` from `$app/forms` before processing it. `applyAction` can be used to process the result.

Form actions are the preferred way to send data to the server because they can be progressively enhanced.

