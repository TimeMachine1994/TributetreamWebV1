<script lang="ts">
import Calc from '$lib/Calc.svelte';


</script>
<div class="flex flex-col items-center justify-center text-center p-8">
    <p class="text-xl mb-4">Tributestream offers their sinciere condolences for your loss.</p>
    <p class="text-lg mb-6">Scan the QR code below to see a free sample of what your custom page will look like.</p>

    <div class="flex justify-center items-center mb-8">
        <div class="p-6 bg-white rounded-lg shadow-md">
            <a href="https://www.google.com" target="_blank">
                <button class="w-[100px] h-[100px] bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200" aria-label="QR Code Scanner"></button>
            </a>
        </div>
    </div>

    <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-2">
        Click Here
    </button>
    <p class="text-lg">To Complete The Reservation Process</p>
</div>

<Calc/>
