<script lang="ts">
  interface MemorialEvent {
    eventName: string;
    locationName: string;
    locationAddress: string;
    startTime: string;
    endTime: string;
    startDate: string;
    durationMinutes: number;
  }

  interface FuneralHome {
    id: number;
    attributes: {
      name: string;
    };
  }

  interface Package {
    id: number;
    attributes: {
      title: string;
    };
  }

  interface User {
    id: number;
    username: string;
    email: string;
  }

  interface FormData {
    error?: string;
    data?: {
      lovedOnesFullName?: string;
      lovedOnesDOB?: string;
      lovedOnesDOD?: string;
      paymentComplete?: boolean;
      customHTML?: string;
      funeral_home?: number;
      package?: number;
      events?: MemorialEvent[];
      users_permissions_user?: number;
      users_permissions_users?: number[];
    };
  }

  let { data, form } = $props<{ 
    data: {
      funeralHomes: FuneralHome[];
      packages: Package[];
      users: User[];
    },
    form?: FormData 
  }>();

  let events = $state<MemorialEvent[]>([]);

  function addEvent() {
    console.log('🎉 Adding new event');
    events = [...events, {
      eventName: '',
      locationName: '',
      locationAddress: '',
      startTime: '',
      endTime: '',
      startDate: '',
      durationMinutes: 0
    }];
  }

  function removeEvent(index: number) {
    console.log('🗑️ Removing event at index', index);
    events = events.filter((_, i) => i !== index);
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Create New Tribute</h1>

  {#if form?.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {form.error}
    </div>
  {/if}

  <form method="POST" class="max-w-2xl">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="lovedOnesFullName">
        Loved One's Full Name *
      </label>
      <input
        type="text"
        id="lovedOnesFullName"
        name="lovedOnesFullName"
        required
        value={form?.data?.lovedOnesFullName ?? ''}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="lovedOnesDOB">
        Date of Birth *
      </label>
      <input
        type="date"
        id="lovedOnesDOB"
        name="lovedOnesDOB"
        required
        value={form?.data?.lovedOnesDOB ?? ''}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="lovedOnesDOD">
        Date of Death *
      </label>
      <input
        type="date"
        id="lovedOnesDOD"
        name="lovedOnesDOD"
        required
        value={form?.data?.lovedOnesDOD ?? ''}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="funeral_home">
        Funeral Home
      </label>
      <select
        id="funeral_home"
        name="funeral_home"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="">Select a Funeral Home</option>
        {#each data.funeralHomes as funeralHome}
          <option 
            value={funeralHome.id}
            selected={form?.data?.funeral_home === funeralHome.id}
          >
            {funeralHome.attributes.name}
          </option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="package">
        Package
      </label>
      <select
        id="package"
        name="package"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="">Select a Package</option>
        {#each data.packages as pkg}
          <option 
            value={pkg.id}
            selected={form?.data?.package === pkg.id}
          >
            {pkg.attributes.title}
          </option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="primary_user">
        Primary Owner
      </label>
      <select
        id="primary_user"
        name="primary_user"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="">Select Primary Owner</option>
        {#each data.users as user}
          <option
            value={user.id}
            selected={form?.data?.users_permissions_user === user.id}
          >
            {user.email}
          </option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        Associated Users
      </label>
      <div class="max-h-48 overflow-y-auto border rounded p-3">
        {#each data.users as user}
          <label class="flex items-center mb-2">
            <input
              type="checkbox"
              name="associated_users"
              value={user.id}
              checked={form?.data?.users_permissions_users?.includes(user.id)}
              class="mr-2"
            />
            <span>{user.email}</span>
          </label>
        {/each}
      </div>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          name="paymentComplete"
          checked={form?.data?.paymentComplete ?? false}
          class="mr-2"
        />
        <span class="text-gray-700 text-sm font-bold">Payment Complete</span>
      </label>
    </div>

    <div class="mb-6">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="customHTML">
        Custom HTML Content
      </label>
      <textarea
        id="customHTML"
        name="customHTML"
        rows="6"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >{form?.data?.customHTML ?? ''}</textarea>
    </div>

    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <label class="block text-gray-700 text-sm font-bold">Memorial Events</label>
        <button
          type="button"
          onclick={addEvent}
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Event
        </button>
      </div>

      {#each events as event, index}
        <div class="border rounded p-4 mb-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">Event #{index + 1}</h3>
            <button
              type="button"
              onclick={() => removeEvent(index)}
              class="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Event Name
              </label>
              <input
                type="text"
                name={`events[${index}].eventName`}
                bind:value={event.eventName}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Location Name
              </label>
              <input
                type="text"
                name={`events[${index}].locationName`}
                bind:value={event.locationName}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Location Address
              </label>
              <input
                type="text"
                name={`events[${index}].locationAddress`}
                bind:value={event.locationAddress}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Start Date
              </label>
              <input
                type="date"
                name={`events[${index}].startDate`}
                bind:value={event.startDate}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name={`events[${index}].durationMinutes`}
                bind:value={event.durationMinutes}
                min="0"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Start Time
              </label>
              <input
                type="time"
                name={`events[${index}].startTime`}
                bind:value={event.startTime}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                End Time
              </label>
              <input
                type="time"
                name={`events[${index}].endTime`}
                bind:value={event.endTime}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="flex items-center justify-between">
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Create Tribute
      </button>
      <a
        href="/admin/tributes"
        class="text-blue-500 hover:text-blue-800"
      >
        Cancel
      </a>
    </div>
  </form>
</div>