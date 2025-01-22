<script lang="ts">
    import Calc from '$lib/Calc.svelte';
    import CcForm from '$lib/CcForm.svelte';
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    
    let { data }: { data: PageData } = $props();
    const appId = data.appId;
    const locationId = data.locationId;
    let fdFormData = data.userMeta.memorial_form_data;
    console.log('Form Data (Raw):', fdFormData);
    let card = $state('');
    let tributeCreated = $state(false);
    let tributeSlug = $state('');
    let tributeError = $state('');

    // Function to create a URL-friendly slug
    function slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Function to create tribute table entry
    async function createTributeEntry() {
        try {
            const parsedData = JSON.parse(fdFormData);
            const fullName = `${parsedData.deceased.firstName} ${parsedData.deceased.lastName}`;
            const slug = slugify(fullName);
            
            const response = await fetch('/api/tribute-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({
                    user_id: data.userId,
                    loved_one_name: fullName,
                    slug: slug
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create tribute entry');
            }

            tributeCreated = true;
            tributeSlug = slug;
            tributeError = '';
        } catch (error: unknown) {
            console.error('Failed to create tribute entry:', error);
            if (error instanceof Error) {
                tributeError = error.message;
            } else {
                tributeError = 'Failed to create tribute entry';
            }
        }
    }

    // Function to navigate to celebration page
    function goToCelebrationPage() {
        if (tributeSlug) {
            goto(`/celebration-of-life-for-${tributeSlug}`);
        }
    }
 
    // Parse and flatten the JSON string
    let flattenedFormData: any = {};
    if (fdFormData) {
        try {
            const parsedData = JSON.parse(fdFormData);

            // Flattening logic
            flattenedFormData = {
                directorFirstName: parsedData.director.firstName,
                directorLastName: parsedData.director.lastName,
                familyMemberFirstName: parsedData.familyMember.firstName,
                familyMemberLastName: parsedData.familyMember.lastName,
                familyMemberDob: parsedData.familyMember.dob,
                deceasedFirstName: parsedData.deceased.firstName,
                deceasedLastName: parsedData.deceased.lastName,
                deceasedDob: parsedData.deceased.dob,
                deceasedDop: parsedData.deceased.dop,
                contactEmail: parsedData.contact.email,
                contactPhone: parsedData.contact.phone,
                memorialLocationName: parsedData.memorial.locationName,
                memorialLocationAddress: parsedData.memorial.locationAddress,
                memorialTime: parsedData.memorial.time,
                memorialDate: parsedData.memorial.date
            };

            console.log('Flattened Form Data:', flattenedFormData);
        } catch (error) {
            console.error('Failed to parse and flatten JSON data:', error);
        }
    }
 
    const originalData = $state({
        firstName: flattenedFormData.familyMemberFirstName || '',
        lastName: flattenedFormData.familyMemberLastName || '',
        email: flattenedFormData.contactEmail || '',
        phone: flattenedFormData.contactPhone || '',
        address: flattenedFormData.memorialLocationAddress || '',
    });
</script>

<div class="container mx-auto p-4">
    <Calc
        funeralHomeName={flattenedFormData.memorialLocationName}
        funeralDirectorName={`${flattenedFormData.directorFirstName} ${flattenedFormData.directorLastName}`}
        locationName={flattenedFormData.memorialLocationName}
        locationAddress={flattenedFormData.memorialLocationAddress}
        memorialDate={flattenedFormData.memorialDate}
    />

    <CcForm appId={appId} locationId={locationId} initialData={originalData}/>

    {#if !tributeCreated && !tributeError}
        <div class="mt-8">
            <button
                on:click={createTributeEntry}
                class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
                Create Celebration Page
            </button>
        </div>
    {/if}

    {#if tributeError}
        <div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {tributeError}
        </div>
    {/if}

    {#if tributeCreated}
        <div class="mt-8">
            <p class="text-green-600 mb-4">Celebration page created successfully!</p>
            <button
                on:click={goToCelebrationPage}
                class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
            >
                View Celebration Page
            </button>
        </div>
    {/if}
</div>
