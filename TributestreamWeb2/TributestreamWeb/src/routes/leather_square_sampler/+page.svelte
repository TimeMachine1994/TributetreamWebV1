<script lang="ts">
    let selectedSquare: number | null = $state(null);

    // Function to handle square selection
    function handleSquareClick(index: number) {
        selectedSquare = index;
    }
</script>

<style>
  /* Base styles for the button */
  .tactile-button {
      width: 20vw;
      height: 20vw;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 4px solid #333;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), inset 0 -2px 8px rgba(0, 0, 0, 0.2);
      background-size: 200%; /* Texture scaling */
      background-position: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  /* Matte texture */
  .matte {
      background: linear-gradient(145deg, #444 10%, #555 50%, #666 90%);
  }

  /* Cloth texture using a subtle grid */
  .cloth {
      background: linear-gradient(135deg, #bbb 25%, transparent 25%) -20px 0,
                  linear-gradient(225deg, #bbb 25%, transparent 25%) -20px 0,
                  linear-gradient(315deg, #bbb 25%, transparent 25%),
                  linear-gradient(45deg, #bbb 25%, transparent 25%);
      background-size: 40px 40px;
      background-color: #888;
  }

  /* Leather texture using gradients */
  .leather {
      background: radial-gradient(circle, #a52a2a, #8b0000 80%);
      box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.5);
  }

  /* Tactile feedback on hover and selection */
  .tactile-button:hover {
      transform: scale(1.02);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4), inset 0 -4px 12px rgba(0, 0, 0, 0.3);
  }

  .selected {
      box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3);
      transform: scale(0.98);
  }
</style>

<!-- Squares Layout -->
<div class="flex justify-center gap-8 p-8">
    <!-- Square 1: Matte -->
    <div
        class={`tactile-button matte ${
            selectedSquare === 0 ? 'selected' : ''
        }`}
        on:click={() => handleSquareClick(0)}
    ></div>

    <!-- Square 2: Cloth -->
    <div
        class={`tactile-button cloth ${
            selectedSquare === 1 ? 'selected' : ''
        }`}
        on:click={() => handleSquareClick(1)}
    ></div>

    <!-- Square 3: Leather -->
    <div
        class={`tactile-button leather ${
            selectedSquare === 2 ? 'selected' : ''
        }`}
        on:click={() => handleSquareClick(2)}
    ></div>
</div>
