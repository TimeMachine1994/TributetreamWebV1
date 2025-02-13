<script lang="ts">
    import type { PageData } from './$types';

    interface MemorialFormData {
        director: {
            firstName: string;
            lastName: string;
        };
        familyMember: {
            firstName: string;
            lastName: string;
            dob: string;
        };
        deceased: {
            firstName: string;
            lastName: string;
            dob: string;
            dop: string;
        };
        contact: {
            email: string;
            phone: string;
        };
        memorial: {
            locationName: string;
            locationAddress: string;
            time: string;
            date: string;
        };
    }

    export let data: PageData;
    $: memorialData = data.memorialData as MemorialFormData;
    $: error = data.error;

    // Format the full name of the deceased
    $: deceasedFullName = memorialData ? 
        `${memorialData.deceased.firstName} ${memorialData.deceased.lastName}` : 
        'GAP';

    // Format the location
    $: locationInfo = memorialData ? 
        {
            name: memorialData.memorial.locationName || 'GAP',
            address: memorialData.memorial.locationAddress || 'GAP'
        } : 
        { name: 'GAP', address: 'GAP' };

    // Format the date and time
    $: eventDateTime = memorialData ? 
        `${memorialData.memorial.date} @ ${memorialData.memorial.time}` : 
        'GAP';
</script>

{#if error}
    <div class="p-4 bg-red-100 text-red-700 rounded-md mb-4">
        {error}
    </div>
{:else}
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Card: Payment Status and Event Overview -->
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
            <!-- Payment Status Bar -->
            <div class="flex items-center justify-between bg-green-50 border border-green-300 rounded p-3">
                <div class="flex items-center space-x-2 text-green-700">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.285 2.998a1 1 0 0 1 .709 1.707l-11 11a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414l4.293 4.293 10.293-10.293a1 1 0 0 1 1.414 0z"/>
                    </svg>
                    <span class="font-semibold">Payment Status: GAP</span>
                </div>
            </div>
            
            <!-- Main Event Details -->
            <div class="flex flex-col md:flex-row md:space-x-6">
                <!-- Text Details -->
                <div class="md:flex-1 space-y-2 mb-4 md:mb-0">
                    <!-- Title of the Event -->
                    <h2 class="text-2xl font-bold text-gray-700">Celebration of life for {deceasedFullName}</h2>

                    <!-- Starting Location -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-600">Starting Location</h3>
                        <p class="text-gray-800">{locationInfo.name}</p>
                        <p class="text-gray-800">{locationInfo.address}</p>
                    </div>

                    <!-- Start Time -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-600">Start Time</h3>
                        <p class="text-gray-800">{eventDateTime}</p>
                    </div>

                    <!-- Notes -->
                    <div>
                        <h3 class="text-sm font-semibold text-gray-600">Notes</h3>
                        <p class="text-gray-800">GAP</p>
                    </div>
                </div>
                
                <!-- Media Placeholder -->
                <div class="md:w-1/2 h-48 bg-black rounded flex items-center justify-center text-white">
                    <span class="text-sm">Media Placeholder</span>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <button class="flex-1 bg-blue-100 text-blue-800 py-2 px-4 rounded shadow text-center font-semibold">
                Upload Media for Livestream
            </button>
            <button class="flex-1 bg-red-100 text-red-800 py-2 px-4 rounded shadow text-center font-semibold">
                Edit Livestream Schedule
            </button>
            <button class="flex-1 bg-pink-100 text-pink-800 py-2 px-4 rounded shadow text-center font-semibold">
                Transfer Family Point of Contact
            </button>
            <button class="flex-1 bg-purple-100 text-purple-800 py-2 px-4 rounded shadow text-center font-semibold">
                Invite Others to Share Media
            </button>
        </div>

        <!-- Current Livestream Schedule Section -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-700">Current Livestream Schedule</h3>
                <button class="bg-red-100 text-red-800 py-1 px-3 rounded shadow font-semibold">
                    Edit
                </button>
            </div>
            
            <!-- Table Headers -->
            <div class="hidden md:grid grid-cols-4 text-gray-600 font-semibold text-sm border-b border-gray-200 pb-2">
                <span>Start Time</span>
                <span>Stream Type</span>
                <span>Est. Duration</span>
                <span>Location</span>
            </div>
            
            <!-- Schedule Entries (Using GAP as placeholder) -->
            <div class="grid grid-cols-1 md:grid-cols-4 items-center text-gray-800 py-3 border-b border-gray-100">
                <span class="font-semibold">GAP</span>
                <span>GAP</span>
                <span>GAP</span>
                <span>GAP</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 items-center text-gray-800 py-3 border-b border-gray-100">
                <span class="font-semibold">GAP</span>
                <span>GAP</span>
                <span>GAP</span>
                <span>GAP</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 items-center text-gray-800 py-3">
                <span class="font-semibold">GAP</span>
                <span>GAP</span>
                <span>GAP</span>
                <span>GAP</span>
            </div>
        </div>
    </div>
{/if}
