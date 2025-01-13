<script lang="ts"> 
import Navbar from '$lib/Navbar.svelte';
import Footer from '$lib/Footer.svelte';


let { data, children } = $props();

// // User state
// let user = $state(data.user || null);
 

//  const fdForm = {
//     directorFirstName: '',
//     directorLastName: '',
//     deceasedFirstName: '',
//     deceasedLastName: '',
//     deceasedDOB: '',
//     deceasedDOD: '',
//     familyMemberEmail: '',
//     familyMemberPhone: '',
//     familyMemberDOB: '',
//     initialMemorialName: '',
//     initialMemorialAddress: '', 
//     initialMemorialTime: '',   
//     initialMemorialDate: '',   
//  }

// const calculator = {livestreamAtFuneralHome: '', selectedPackage: ''};
// // This is data from the JWT token response
// let isLoggedIn = $derived(!!user);
// let id = $state(user?.id);
// let email = $state(user?.email);
// let niceName = $state(user?.niceName);
// let firstName = $state(user?.firstName);
// let lastName = $state(user?.lastName);    
// let displayName = $state(user?.displayName);

// // These are the data collected from the funeral directror form.
// let fdFirstName = $state();
// let fdLastName = $state(fdForm?.directorLastName);
// let familyMemberDOB = $state(fdForm?.familyMemberDOB);
// let lovedOnesName = $state(fdForm?.deceasedFirstName);
// let deceasedLastName = $state(fdForm?.deceasedLastName);
// let deceasedDOB = $state(fdForm?.deceasedDOB);
// let deceasedDOD = $state(fdForm?.deceasedDOD);
// let loved
// let familyMemberEmail = $state(fdForm?.familyMemberEmail);
// let familyMemberPhone = $state(fdForm?.familyMemberPhone);
// let initialMemorialName = $state(fdForm?.initialMemorialName); 
// let initialMemorialAddress = $state(fdForm?.initialMemorialAddress); 
// let initialMemorialTime = $state(fdForm?.initialMemorialTime); 
// let initialMemorialDate = $state(fdForm?.initialMemorialDate); 

// let livestreamAtFuneralHome = $state(calculator?.livestreamAtFuneralHome);
// let selectedPackage = $state(calculator?.selectedPackage);




</script>
<Navbar />

{@render children()}

<Footer />

