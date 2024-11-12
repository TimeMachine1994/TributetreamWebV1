<script>
  import { onMount } from 'svelte';

  let name = '';
  let phoneNumber = '';
  let email = '';
  let message = '';
  let showForm = true;
  let showSuccess = false;

  async function handleSubmit() {
    console.log('Form submitted:', { name, email, message });
    const subject = "New Registration from " + name + " - " + phoneNumber;
    const adminEmail = "contact.form@tributestream.com";

    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/registration_email/v1/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: adminEmail,
                subject: subject,
                message: message
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Submission error:', error);
        throw error;
    }
}
</script>

<main>
   <div class="transition-all duration-500 transform" class:translate-y-[-100vh]={!showForm}>
    <div class="card p-4">
        <div class="hero">
            <p class="text-2xl p-4 text-center">Contact Us</p>
            <p class="text-center">We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.</p>
        </div>
    </div>

    <section class="card p-4 mt-4">
        <form on:submit|preventDefault={handleSubmit}>
            <label class="label">
                <span>Name</span>
                <input class="input" type="text" bind:value={name} placeholder="Your first and last name" required />
            </label>
            <label class="label">
                <span>Phone Number</span>
                <input class="input" type="tel" bind:value={phoneNumber} placeholder="Your Phone Number" required />
            </label>
            <label class="label">
                <span>Email Address</span>
                <input class="input" type="email" bind:value={email} placeholder="Your Email Address" required />
            </label>
            <label class="label">
                <span>Message</span>
                <textarea class="textarea" bind:value={message} rows="4" placeholder="Please enter your message here." required></textarea>
            </label>
            <button type="submit" class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black">Send</button>
        </form>
    </section>

    <div class="fixed inset-0 flex items-center justify-center transition-opacity duration-500"
        class:opacity-0={!showSuccess}
        class:opacity-100={showSuccess}>
        <div class="bg-[#D5BA7F] text-black p-8 rounded-lg shadow-xl text-center">
            <h2 class="text-2xl font-['Fanwood_Text'] italic">Success!</h2>
            <p>Your message has been sent successfully.</p>
        </div>
    </div>
</div>
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  .card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .hero {
    text-align: center;
    margin-bottom: 20px;
  }

  .label {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
  }

  .input, .textarea {
    width: 100%;
    padding: 12px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .textarea {
    resize: vertical;
  }

  button {
    align-self: flex-start;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #CFCFCE;
  }
</style>
