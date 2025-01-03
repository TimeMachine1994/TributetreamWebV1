<script>
    export let steps = [
      {
        number: "1",
        title: "RESERVE",
        description:
          "Start the reservation process with a trusted funeral director who will gather needed information.",
      },
      {
        number: "2",
        title: "RECEIVE",
        description:
          "Receive an email to finalize your reservation and get a shareable link to send to your community.",
      },
      {
        number: "3",
        title: "RECORD",
        description:
          "Recording and broadcast of the memorial is done by our team, on-site, the day of the service.",
      },
      {
        number: "4",
        title: "RETURN",
        description:
          "Return to the shareable link to watch the memorial anytime for 1 year.",
      },
    ];
  </script>
  
  <div class="bg-gray-900 text-white py-10 px-5">
    <div class="flex flex-wrap justify-center">
      {#each steps as step, index}
        <div
          class="flex flex-col items-center w-full md:w-1/4 border-l-4 border-yellow-500 px-4 py-4 md:py-8 md:px-6"
        >
          <div
            class="rounded-full bg-yellow-500 text-black w-10 h-10 flex items-center justify-center text-xl font-bold"
          >
            {step.number}
          </div>
          <div class="mt-4 text-xl font-bold text-center">{step.title}</div>
          <p class="mt-2 text-sm text-center">{step.description}</p>
        </div>
        {#if index < steps.length - 1}
          <!-- Arrow -->
          <div class="hidden md:flex items-center text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        {/if}
      {/each}
    </div>
  </div>
  