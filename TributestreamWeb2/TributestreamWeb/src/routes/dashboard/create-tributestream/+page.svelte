<script>
    import { z } from "zod";
    import { createForm } from "@superforms/svelte";
  
    // Validation Schema using zod
    const livestreamSchema = z.object({
      event_name: z.string().min(1, "Event name is required."),
      event_address: z.string().optional(),
      event_date: z.string().min(1, "Event date is required."),
      description: z.string().optional(),
    });
  
    // Form setup
    const form = createForm({
      id: "add-livestream", // Optional, for debugging purposes
      schema: livestreamSchema,
      onSubmit: async (data) => {
        try {
          const response = await fetch("/wp-json/custom/v1/tribute-pages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
            body: JSON.stringify(data),
          });
  
          if (!response.ok) {
            const { message } = await response.json();
            return { errors: { form: message || "An error occurred." } };
          }
  
          alert("Livestream added successfully!");
          return { status: "success", message: "Livestream added successfully!" };
        } catch (err) {
          return { errors: { form: "Failed to add livestream. Please try again." } };
        }
      },
    });
  </script>
  
  <div class="bg-white shadow-md rounded p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Add Livestream</h1>
  
    <form use:form class="space-y-4">
      <!-- Event Name -->
      <div>
        <label class="block text-gray-700 font-medium mb-2" for="event_name">Event Name</label>
        <input
          type="text"
          id="event_name"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          name="event_name"
        />
        {#if form.errors.event_name}
          <p class="text-red-500 text-sm">{form.errors.event_name}</p>
        {/if}
      </div>
  
      <!-- Event Address -->
      <div>
        <label class="block text-gray-700 font-medium mb-2" for="event_address">Event Address</label>
        <input
          type="text"
          id="event_address"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          name="event_address"
        />
      </div>
  
      <!-- Event Date -->
      <div>
        <label class="block text-gray-700 font-medium mb-2" for="event_date">Event Date</label>
        <input
          type="datetime-local"
          id="event_date"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          name="event_date"
        />
        {#if form.errors.event_date}
          <p class="text-red-500 text-sm">{form.errors.event_date}</p>
        {/if}
      </div>
  
      <!-- Description -->
      <div>
        <label class="block text-gray-700 font-medium mb-2" for="description">Description</label>
        <textarea
          id="description"
          class="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="4"
          name="description"
        ></textarea>
      </div>
  
      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={form.isSubmitting}
        >
          {form.isSubmitting ? "Saving..." : "Add Livestream"}
        </button>
      </div>
  
      <!-- Global Error Message -->
      {#if form.errors.form}
        <p class="text-red-500 text-sm mt-2">{form.errors.form}</p>
      {/if}
    </form>
  </div>
  