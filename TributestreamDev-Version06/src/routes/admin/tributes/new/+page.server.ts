import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

interface MemorialEvent {
  eventName: string;
  locationName: string;
  locationAddress: string;
  startTime: string;
  endTime: string;
  startDate: string;
  durationMinutes: number;
}

function isValidEventField(field: string): field is keyof MemorialEvent {
  return [
    'eventName',
    'locationName',
    'locationAddress',
    'startTime',
    'endTime',
    'startDate',
    'durationMinutes'
  ].includes(field);
}

export const load = (async ({ fetch }) => {
  // Fetch users
  console.log('👥 Loading users...');
  const usersResponse = await fetch('/api/users');
  if (!usersResponse.ok) {
    console.error('❌ Failed to load users:', usersResponse.statusText);
    error(usersResponse.status, 'Failed to load users');
  }
  const usersData = await usersResponse.json();
  console.log('✅ Loaded users:', usersData);

  // Fetch funeral homes
  console.log('🏢 Loading funeral homes...');
  const funeralHomesResponse = await fetch('/api/funeral-homes');
  if (!funeralHomesResponse.ok) {
    console.error('❌ Failed to load funeral homes:', funeralHomesResponse.statusText);
    error(funeralHomesResponse.status, 'Failed to load funeral homes');
  }
  const funeralHomesData = await funeralHomesResponse.json();
  console.log('✅ Loaded funeral homes:', funeralHomesData);

  // Fetch packages
  console.log('📦 Loading packages...');
  const packagesResponse = await fetch('/api/packages');
  if (!packagesResponse.ok) {
    console.error('❌ Failed to load packages:', packagesResponse.statusText);
    error(packagesResponse.status, 'Failed to load packages');
  }
  const packagesData = await packagesResponse.json();
  console.log('✅ Loaded packages:', packagesData);

  return {
    funeralHomes: funeralHomesData.data,
    packages: packagesData.data,
    users: usersData
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, fetch }) => {
    console.log('📝 Creating new tribute...');
    
    const formData = await request.formData();
    
    // Process events data
    const events: Record<keyof MemorialEvent, any>[] = [];
    let hasEvents = false;

    console.log('🎭 Processing event data from form...');
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('events[')) {
        hasEvents = true;
        // Extract index and field name from key like "events[0].eventName"
        const matches = key.match(/events\[(\d+)\]\.(\w+)/);
        if (matches) {
          const [, index, field] = matches;
          const idx = parseInt(index);
          
          // Initialize event object if needed
          if (!events[idx]) {
            events[idx] = {
              eventName: '',
              locationName: '',
              locationAddress: '',
              startTime: '',
              endTime: '',
              startDate: '',
              durationMinutes: 0
            };
          }
          
          // Only process valid fields
          if (isValidEventField(field)) {
            if (field === 'durationMinutes') {
              events[idx][field] = parseInt(value.toString()) || 0;
            } else {
              events[idx][field] = value.toString();
            }
          }
        }
      }
    }

    console.log('✨ Processed events:', events);

    const tributeData = {
      data: {
        lovedOnesFullName: formData.get('lovedOnesFullName'),
        lovedOnesDOB: formData.get('lovedOnesDOB'),
        lovedOnesDOD: formData.get('lovedOnesDOD'),
        paymentComplete: formData.get('paymentComplete') === 'on',
        customHTML: formData.get('customHTML'),
        funeral_home: formData.get('funeral_home'),
        package: formData.get('package'),
        events: hasEvents ? events : undefined,
        users_permissions_user: formData.get('primary_user'),
        users_permissions_users: formData.getAll('associated_users').map(id => Number(id))
      }
    };

    console.log('📦 Tribute data:', tributeData);

    try {
      const response = await fetch('/api/tributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tributeData)
      });

      if (!response.ok) {
        console.error('❌ Failed to create tribute:', response.statusText);
        return fail(response.status, {
          error: 'Failed to create tribute',
          data: tributeData.data
        });
      }

      console.log('✅ Tribute created successfully!');
      redirect(303, '/admin/tributes');
    } catch (error) {
      console.error('❌ Error creating tribute:', error);
      return fail(500, {
        error: 'Internal server error',
        data: tributeData.data
      });
    }
  }
} satisfies Actions;