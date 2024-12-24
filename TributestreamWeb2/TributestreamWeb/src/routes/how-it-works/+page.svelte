
<script lang="ts">
    import { onMount } from 'svelte';
    import CardSteps from '../../lib/components/CardSteps.svelte';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

    let pageTitle = 'How does it work?';
    let isLoading = $state(false);
   let homeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9L12 2l9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/><path d="M9 22h6" /></svg>';
   let urnSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8c0-2 3-3 3-7s-2-6-2-8H7c0 2-2 4-2 8s3 5 3 7z"/><path d="M7 21h10v2H7z"/><path d="M10 3h4c0 1-1 2-2 2s-2-1-2-2z"/><path d="M9 5h6v2H9z"/></svg>';
   let graveSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V12c0-4 4-10 8-10s8 6 8 10v10H4z"/><path d="M9 18h6"/><path d="M9 14h6"/></svg>';

    let tableArr = [
            {
                name: "A Community Funeral Home and Sunset Cremations (Orlando)",
                type: "Funeral Home and Crematory", homeSVG, urnSVG,
                address:  "910 W Michigan St, Orlando, FL 32805",
                website: "https://www.acommunityfuneralhome.com/"
            },
            {
                name: "Osceola Memory Gardens Cemetery, Funeral Homes & Crematory (Kissimmee)",
                type: "Funeral Home, Crematory, and Graveyard", homeSVG, urnSVG, graveSVG,
                address:  "1717 Old Boggy Creek Rd, Kissimmee, FL 34744",
                website: "https://www.osceolamemgds.com/"
            }, 
            {
                name: "Osceola Memory Gardens Cemetery, Funeral Homes & Crematory (Poinciana)",
                type: "Funeral Home", homeSVG,
                address: "3175 Pleasant Hill Rd, Kissimmee, FL 34746",
                website: "https://www.osceolamemgds.com/"
            }, 
            {
                name: "Woodlawn Funeral Home & Memorial Park (Gotha)",
                type: "Funeral Home", homeSVG, graveSVG,
                address:  "400 Woodlawn Cemetery Rd, Gotha, FL 34734",
                website: "https://www.dignitymemorial.com/funeral-homes/florida/gotha/woodlawn-memorial-park-funeral-home/4200"
            }, 
            {
                name: "Fisk Funeral Home & Crematory (Saint Cloud)",
                type: "Funeral Home", homeSVG,
                address:  "3175 Pleasant Hill Rd, Kissimmee, FL 34746",
                website: "https://www.fiskfh.com/"
            }, 
            {
                name: "Dale Woodward Funeral Homes (St Cloud)",
                type: "Funeral Home", homeSVG,
                address:  "167 Ridgewood Ave Daytona Beach, FL 32117",
                website: "https://www.dalewoodwardfuneralhomes.com/"
            }, 
            {
                name: "Lohman Funeral Homes (Deltona)",
                type: "Funeral Home, Crematory, and Gravesite", homeSVG, urnSVG, graveSVG,
                address:  "1423 Bellevue AVe. Daytona Beach FL, 32114",
                website: "https://www.lohmanfuneralhomes.com/locations/daytona-beach"
            }, 
            {
                name: "DeGusipe Funeral Home & Crematory (Maitland)",
                type: "Funeral Home and Crematory", homeSVG, urnSVG,
                address:  "9001 Orlando Ave, Maitland, FL 32751",
                website: "https://www.degusipefuneralhome.com/"
            }, 
            {
                name: "Cape Canaveral National Cemetery (Brevard)",
                type: "Gravesite", graveSVG,
                address:  "Q44J+Q9, 5525 US-1, Mims, FL 32754",
                website: "https://www.degusipefuneralhome.com/"
            }, 
    ];

    onMount(() => {
      // Simulating some asynchronous operation
      setTimeout(() => {
        isLoading = false;
      }, 1000);
    });
  </script>
  
  <svelte:head>
    <title>{pageTitle}</title>  
  </svelte:head>


  <main>
    
    {#if isLoading}
        <p>Loading...</p>
    {:else}
      <h1>{pageTitle}</h1>
      <p>   </p>
    <CardSteps steps={[
        { title: "Step 1: Decide a Location", description: "Pick a location for the tribute." },
        { title: "Step 2: Schedule Tributestream", description: "Choose a date and time for the service." },
        { title: "Step 3: Go Live", description: "Once we broadcast the service, the link will stay live for at least a year." }
        ]} />   
        <div class="card">
            <header class="card-header">
                <i>Pre-Qualified Tributestream Locations:</i>
            </header>
                <section class="p-4">
                    <div class="table-container">
                        <table class="table table-hover min-w-full">
                            <thead class="bg-gray-100 text-left">
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Address</th>
                                    <th>Website</th>
                                </tr>
                            </thead>
                         <tbody>
                                {#each tableArr as row, i}
                                    <tr>
                                        <td >
                                            {row.name}
                                        </td>
                                        <td>
                                            {row.type}
                                            {#if row.homeSVG}
                                                {@html row.homeSVG}
                                            {/if}
                                            {#if row.urnSVG}
                                                {@html row.urnSVG}
                                            {/if}
                                            {#if row.graveSVG}
                                                {@html row.graveSVG}
                                            {/if}
                                        </td>
                                        <td>{row.address}</td>
                                        <td>{row.website}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                 </section>   
        </div>
    {/if}
</main>

<style>       
    main {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }
  
    h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 1rem;
    }
  
    p {
      line-height: 1.6;
    }
  </style>
  