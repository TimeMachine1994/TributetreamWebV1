
<script>
  import { onMount } from 'svelte';

  let name = '';
  let email = '';
  let message = '';
//Actually program this when it is ready 
 //   function handleSubmit() {
//     // Handle form submission logic here
//     console.log('Form submitted:', { name, email, message });
    
//     // Send email using a server-side API
//     fetch('/api/send-email', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, email, message }),
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             console.log('Email sent successfully');
//             // Clear form fields or show success message to user
//         } else {
//             console.error('Failed to send email:', data.error);
//             // Show error message to user
//         }
//     })
//     .catch(error => {
//         console.error('Error sending email:', error);
//         // Show error message to user
//     });
//   }  
</script>

<main>
    <div class="card p-4">
        <div class="hero">
        <p class="text-2xl p-4">Contact Us</p>
             <p>We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.</p>
        </div>
    </div>
    <section class="card p-4 mt-4">
   <form on:submit|preventDefault={handleSubmit}>
        <label class="label">
            <span>Name</span>
            <input class="input" type="text" placeholder="Your first and last name" />
        </label>
        <label class="label">
            <span>Phone Number</span>
            <input class="input" type="text" placeholder="Your Phone Number" />
        </label>
        <label class="label">
            <span>Email Address</span>
            <input class="input" type="text" placeholder="Your Email Address" />
        </label>
        <label class="label">
        <span>Message</span>
        <textarea class="textarea" rows="4" placeholder="Please enter your message here." />
        </label>
				
    <button type="submit" class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">Send</button>
  </form>
  </section>
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }



  input, textarea {
    width: 100%;
    padding: 8px;
  }

  button {
    align-self: flex-start;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
  }

</style>
