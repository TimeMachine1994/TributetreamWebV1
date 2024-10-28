<script>
    export let steps = [
      { title: "Step 1", description: "Brief description of step 1." },
      { title: "Step 2", description: "Brief description of step 2." },
      { title: "Step 3", description: "Brief description of step 3." }
    ];
  </script>
  
  <div class="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-6 p-6">
    {#each steps as step (step.title)}
      <div class="bg-[#070707] text-white rounded-lg shadow-lg p-6 w-full md:w-1/3">
        <div class="flex items-center justify-center mb-4">
          <div class="bg-[#FF7E00] text-black rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold">
            {step.title.split(' ')[1]}
          </div>
        </div>
        <h3 class="text-xl font-semibold mb-4 text-center">{step.title}</h3>
        <p class="text-center text-gray-300">{step.description}</p>
      </div>
    {/each}
  </div>
  