<script lang="ts">
    import { masterStore } from './stores/userStore';
    import { packages } from './data/packages';
    import type { PackageDetails } from './stores/types';

    let selectedSquare: number | null = $state(null);

    // Initialize with no selection before subscription
    masterStore.updateOrderData({
        selectedPackage: undefined
    });

    // Subscribe to store to sync package selection
    masterStore.subscribe(state => {
        if (state.orderData.selectedPackage) {
            selectedSquare = state.orderData.selectedPackage.index;
        } else {
            selectedSquare = null;
        }
    });

    // Function to handle square selection
    function handleSquareClick(index: number) {
        const newIndex = selectedSquare === index ? null : index;
        selectedSquare = newIndex;
        
        // Update store with selected package
        masterStore.updateOrderData({
            selectedPackage: newIndex !== null ? {
                index: newIndex,
                details: packages[newIndex]
            } : undefined
        });
    }

</script>

<style>
  /* Custom CSS for the 3D glass effect */
  .glass-square {
      backdrop-filter: blur(10px) saturate(150%);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 8px 30px rgba(0, 0, 0, 0.1) inset;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, opacity 0.3s ease;
      padding: 16px;
      position: relative;
  }
  .glass-square:hover {
      transform: scale(1.1) translateZ(10px);
      box-shadow: 0 8px 20px rgba(255, 255, 255, 0.4), 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  .selected {
      border-color: #000000;
      border-width: 2px;
      opacity: 1;
  }

  .faded {
      opacity: 0.5;
      filter: blur(2px);
  }

  .gradient-solo {
      background: linear-gradient(to bottom right, #ffffff, #e0e0ff);
  }

  .gradient-gold {
      background: linear-gradient(to bottom right, #fff8dc, #ffe066);
  }

  .gradient-legacy {
      background: linear-gradient(to bottom right, #b8860b, #e5c078);
  }

  .title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 8px;
  }

  .price {
      font-size: 2rem;
      font-weight: bold;
      margin: 16px 0;
  }

  .bookmark-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      fill: rgba(255, 0, 0, 0.5);
      transition: fill 0.3s ease;
  }

  .selected .bookmark-icon {
      fill: rgba(255, 0, 0, 1);
  }

  .calculator-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease, padding 0.5s ease;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 0 16px;
  }

  .calculator-panel.open {
      max-height: 200px;
      padding: 16px;
  }
</style>

<!-- Squares Layout -->
<div class="flex flex-col items-center gap-8 p-8">
    <div class="flex justify-center gap-8">
        {#each packages as pkg, index}
            <div
                class={`w-[20vw] h-auto glass-square ${
                    index === 0 ? 'gradient-solo' : 
                    index === 1 ? 'gradient-gold' : 
                    'gradient-legacy'
                } ${
                    selectedSquare === index ? 'selected' : 
                    selectedSquare === null ? '' : 'faded'
                }`}
                on:click={() => handleSquareClick(index)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="bookmark-icon"
                >
                    <path d="M6 2c-1.1 0-2 .9-2 2v18l8-5 8 5V4c0-1.1-.9-2-2-2H6z" />
                </svg>
                <h3 class="title">{pkg.name}</h3>
                <i>{pkg.type}</i>
                <p class="price">${pkg.price.toLocaleString()}</p>
                <ul>
                    {#each pkg.features as feature}
                        <li>{feature}</li>
                    {/each}
                </ul>
            </div>
        {/each}
    </div>

    <!-- Calculator Panel -->
    <div class={`calculator-panel ${selectedSquare !== null ? 'open' : ''}`}>
        <div class="calculator-content">
            <h3>Calculator</h3>
            <p>Use this space to calculate additional costs or features for your selection.</p>
        </div>
    </div>
</div>
