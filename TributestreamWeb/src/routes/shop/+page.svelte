
<script>
    import { onMount } from 'svelte';

    let products = [];

    onMount(async () => {
        // Simulating API call to fetch products
        products = [
            { id: 1, name: 'Livestream Setup', price: 700, image: 'path/to/image1.jpg' },
            { id: 2, name: 'Additional Location', price: 349, image: 'path/to/image2.jpg' },
            { id: 3, name: 'Additional Time', price: 149.99, image: 'path/to/image3.jpg' },
            { id: 4, name: 'Photo Restoration', price: 10, image: 'path/to/image1.jpg' },
            { id: 5, name: 'Home Video Restoration', price: 1.25, image: 'path/to/image2.jpg' },
            { id: 6, name: 'Slideshow Production', price: 170, image: 'path/to/image3.jpg' },
            { id: 7, name: 'Engraved USB Drive Backup', price: 210, image: 'path/to/image3.jpg' },
            { id: 8, name: 'Simple USB Drive Backup', price: 120, image: 'path/to/image3.jpg' },
            { id: 9, name: 'Additional One Year of Hosting', price: 50, image: 'path/to/image3.jpg' },

        ];
    });
</script>

<main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4"> Tributestream Services and Tribute Products Shop</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each products as product}
            <div class="card">
                <a class="block card card-hover p-4" href="/shop/product/{product.id}">
                    <header class="card-header">
                        <img src={product.image} alt={product.name} class="w-full h-48 object-cover">
                    </header>
                    <section class="p-4">
                        <h2 class="text-lg font-semibold">{product.name}</h2>
                        <p class="text-gray-600">${product.price.toFixed(2)}</p>
                    </section>
                    <footer class="card-footer">
                        <button class="btn variant-filled-primary w-full">Add to Cart</button>
                    </footer>
                </a>
            </div>
        {/each}
    </div>
</main>


 