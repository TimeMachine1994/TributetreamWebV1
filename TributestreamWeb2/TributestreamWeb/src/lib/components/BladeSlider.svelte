<script>
    export let items = [];
    export let title = "Slider Title";
  </script>
  
  <div class="slider-container">
    <h2>{title}</h2>
    <div class="slider">
      {#each items as item}
        <div class="slider-item">
          <slot name="item" {item}></slot>
        </div>
      {/each}
    </div>
  </div>
  
  <style>
    .slider-container {
      margin: 1rem 0;
    }
    .slider {
      display: flex;
      overflow-x: auto;
      gap: 1rem;
    }
    .slider-item {
      flex: 0 0 auto;
      width: 200px;
      border: 1px solid #ccc;
      padding: 1rem;
      border-radius: 8px;
      background-color: #fff;
    }
  </style>
  