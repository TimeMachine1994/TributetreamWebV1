<script lang="ts">
    let selectedSquare: number | null = $state(null);

    // Function to handle square selection
    function handleSquareClick(index: number) {
        selectedSquare = index;
    }
</script>

<style>
  /* Base styles for the 3D button */
  .soft-3d-button {
      width: 20vw;
      height: 20vw;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border 0.2s ease;
  }

  /* Unpressed button */
  .unpressed {
      background: linear-gradient(145deg, #e0e0e0, #c2c2c2);
      box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6);
  }

  /* Pressed button */
  .pressed {
      background: linear-gradient(145deg, #c2c2c2, #e0e0e0);
      box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.6);
      transform: translateY(2px);
  }

  /* Highlight selected button with a border */
  .selected {
      border: 4px solid #ffcc00;
  }

  /* Specific button colors */
  .btn-white-blue {
      background: linear-gradient(145deg, #ffffff, #4a90e2);
      color: blue;
  }
  .btn-white-blue.pressed {
      background: linear-gradient(145deg, #4a90e2, #ffffff);
      color: blue;
  }

  .btn-silver-grey {
      background: linear-gradient(145deg, #c0c0c0, #808080);
      color: grey;
  }
  .btn-silver-grey.pressed {
      background: linear-gradient(145deg, #808080, #c0c0c0);
      color: grey;
  }

  .btn-gold-yellow {
      background: linear-gradient(145deg, #ffd700, #ffcc33);
      color: yellow;
  }
  .btn-gold-yellow.pressed {
      background: linear-gradient(145deg, #ffcc33, #ffd700);
      color: yellow;
  }
</style>

<!-- Squares Layout -->
<div class="flex justify-center gap-8 p-8">
    <!-- Button 1: White and Blue -->
    <div
        class={`soft-3d-button btn-white-blue ${
            selectedSquare === 0 ? 'pressed selected' : 'unpressed'
        }`}
        on:click={() => handleSquareClick(0)}
    >
        Button 1
    </div>

    <!-- Button 2: Silver and Grey -->
    <div
        class={`soft-3d-button btn-silver-grey ${
            selectedSquare === 1 ? 'pressed selected' : 'unpressed'
        }`}
        on:click={() => handleSquareClick(1)}
    >
        Button 2
    </div>

    <!-- Button 3: Gold and Yellow -->
    <div
        class={`soft-3d-button btn-gold-yellow ${
            selectedSquare === 2 ? 'pressed selected' : 'unpressed'
        }`}
        on:click={() => handleSquareClick(2)}
    >
        Button 3
    </div>
</div>
