/**
 * Manual Testing Script for Persistence Layers
 * 
 * This script provides a way to manually test the persistence layers
 * without requiring a testing framework. It can be run directly in the browser
 * or in a Node.js environment with appropriate polyfills.
 * 
 * Usage:
 * 1. In the browser, open the console and paste this script
 * 2. In Node.js, run with appropriate SvelteKit environment variables
 */

// Import persistence layers
import { eventsPersistence } from '../src/lib/persistence/events-persistence';
import { funeralHomesPersistence } from '../src/lib/persistence/funeral-homes-persistence';
import { schedulesPersistence } from '../src/lib/persistence/schedules-persistence';
import { tributePersistence } from '../src/lib/persistence/tribute-persistence';
import { tributeApiV2 } from '../src/lib/api/tribute-api-client-v2';

// Set JWT token if available
const token = localStorage.getItem('jwt_token');
if (token) {
  tributeApiV2.setToken(token);
}

/**
 * Test runner function
 */
async function runTests() {
  console.log('=== Starting Persistence Layer Tests ===');
  
  // Test tribute persistence
  await testTributePersistence();
  
  // Test events persistence
  await testEventsPersistence();
  
  // Test funeral homes persistence
  await testFuneralHomesPersistence();
  
  // Test schedules persistence
  await testSchedulesPersistence();
  
  console.log('=== All Tests Completed ===');
}

/**
 * Test tribute persistence layer
 */
async function testTributePersistence() {
  console.log('\n--- Testing Tribute Persistence ---');
  
  try {
    // Test getting tributes for a user
    console.log('Testing getTributesByUser...');
    const userId = 1; // Replace with a valid user ID
    const tributesResult = await tributePersistence.getTributesByUser(userId);
    
    if (tributesResult.success) {
      console.log(`✅ Successfully retrieved ${tributesResult.data?.length || 0} tributes for user ${userId}`);
      console.log('Sample tribute:', tributesResult.data?.[0]);
    } else {
      console.error('❌ Failed to retrieve tributes:', tributesResult.error);
    }
    
    // Test getting a specific tribute
    if (tributesResult.success && tributesResult.data && tributesResult.data.length > 0) {
      const tributeId = tributesResult.data[0].id;
      console.log(`Testing getTributeById for tribute ${tributeId}...`);
      
      const tributeResult = await tributePersistence.getTributeById(tributeId);
      
      if (tributeResult.success) {
        console.log('✅ Successfully retrieved tribute details');
        console.log('Tribute details:', tributeResult.data);
      } else {
        console.error('❌ Failed to retrieve tribute details:', tributeResult.error);
      }
    }
    
    // Test form data
    console.log('Testing getFormData...');
    const formDataResult = await tributePersistence.getFormData(userId);
    
    if (formDataResult.success) {
      console.log('✅ Successfully retrieved form data');
      console.log('Form data:', formDataResult.data);
    } else {
      console.error('❌ Failed to retrieve form data:', formDataResult.error);
    }
  } catch (error) {
    console.error('❌ Error in tribute persistence tests:', error);
  }
}

/**
 * Test events persistence layer
 */
async function testEventsPersistence() {
  console.log('\n--- Testing Events Persistence ---');
  
  try {
    // Test getting active events
    console.log('Testing getActiveEvents...');
    const eventsResult = await eventsPersistence.getActiveEvents();
    
    if (eventsResult.success) {
      console.log(`✅ Successfully retrieved ${eventsResult.data?.length || 0} active events`);
      console.log('Sample event:', eventsResult.data?.[0]);
    } else {
      console.error('❌ Failed to retrieve active events:', eventsResult.error);
    }
    
    // Test getting events for a location
    console.log('Testing getEventsByLocation...');
    const locationId = 1; // Replace with a valid location ID
    const locationEventsResult = await eventsPersistence.getEventsByLocation(locationId);
    
    if (locationEventsResult.success) {
      console.log(`✅ Successfully retrieved ${locationEventsResult.data?.length || 0} events for location ${locationId}`);
      console.log('Sample event:', locationEventsResult.data?.[0]);
    } else {
      console.error('❌ Failed to retrieve events for location:', locationEventsResult.error);
    }
    
    // Test getting events for a tribute
    console.log('Testing getEventsByTribute...');
    const tributeId = 1; // Replace with a valid tribute ID
    const tributeEventsResult = await eventsPersistence.getEventsByTribute(tributeId);
    
    if (tributeEventsResult.success) {
      console.log(`✅ Successfully retrieved ${tributeEventsResult.data?.length || 0} events for tribute ${tributeId}`);
      console.log('Sample event:', tributeEventsResult.data?.[0]);
    } else {
      console.error('❌ Failed to retrieve events for tribute:', tributeEventsResult.error);
    }
  } catch (error) {
    console.error('❌ Error in events persistence tests:', error);
  }
}

/**
 * Test funeral homes persistence layer
 */
async function testFuneralHomesPersistence() {
  console.log('\n--- Testing Funeral Homes Persistence ---');
  
  try {
    // Test getting all funeral homes
    console.log('Testing getFuneralHomes...');
    const homesResult = await funeralHomesPersistence.getFuneralHomes();
    
    if (homesResult.success) {
      console.log(`✅ Successfully retrieved ${homesResult.data?.funeral_homes?.length || 0} funeral homes`);
      console.log('Sample funeral home:', homesResult.data?.funeral_homes?.[0]);
    } else {
      console.error('❌ Failed to retrieve funeral homes:', homesResult.error);
    }
    
    // Test getting a specific funeral home
    if (homesResult.success && homesResult.data?.funeral_homes && homesResult.data.funeral_homes.length > 0) {
      const homeId = homesResult.data.funeral_homes[0].funeral_home_id;
      console.log(`Testing getFuneralHomeById for funeral home ${homeId}...`);
      
      const homeResult = await funeralHomesPersistence.getFuneralHomeById(homeId);
      
      if (homeResult.success) {
        console.log('✅ Successfully retrieved funeral home details');
        console.log('Funeral home details:', homeResult.data);
      } else {
        console.error('❌ Failed to retrieve funeral home details:', homeResult.error);
      }
    }
  } catch (error) {
    console.error('❌ Error in funeral homes persistence tests:', error);
  }
}

/**
 * Test schedules persistence layer
 */
async function testSchedulesPersistence() {
  console.log('\n--- Testing Schedules Persistence ---');
  
  try {
    // Test getting all schedules
    console.log('Testing getSchedules...');
    const schedulesResult = await schedulesPersistence.getSchedules();
    
    if (schedulesResult.success) {
      console.log(`✅ Successfully retrieved ${schedulesResult.data?.schedules?.length || 0} schedules`);
      console.log('Sample schedule:', schedulesResult.data?.schedules?.[0]);
    } else {
      console.error('❌ Failed to retrieve schedules:', schedulesResult.error);
    }
    
    // Test getting schedules for a tribute
    console.log('Testing getSchedules with tributeId...');
    const tributeId = 1; // Replace with a valid tribute ID
    const tributeSchedulesResult = await schedulesPersistence.getSchedules({ tributeId });
    
    if (tributeSchedulesResult.success) {
      console.log(`✅ Successfully retrieved ${tributeSchedulesResult.data?.schedules?.length || 0} schedules for tribute ${tributeId}`);
      console.log('Sample schedule:', tributeSchedulesResult.data?.schedules?.[0]);
    } else {
      console.error('❌ Failed to retrieve schedules for tribute:', tributeSchedulesResult.error);
    }
    
    // Test getting a specific schedule
    if (schedulesResult.success && schedulesResult.data?.schedules && schedulesResult.data.schedules.length > 0) {
      const scheduleId = schedulesResult.data.schedules[0].schedule_id;
      console.log(`Testing getScheduleById for schedule ${scheduleId}...`);
      
      const scheduleResult = await schedulesPersistence.getScheduleById(scheduleId);
      
      if (scheduleResult.success) {
        console.log('✅ Successfully retrieved schedule details');
        console.log('Schedule details:', scheduleResult.data);
      } else {
        console.error('❌ Failed to retrieve schedule details:', scheduleResult.error);
      }
    }
  } catch (error) {
    console.error('❌ Error in schedules persistence tests:', error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
});