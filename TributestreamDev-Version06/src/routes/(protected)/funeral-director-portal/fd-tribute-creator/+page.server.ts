import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { apiFetch, getStrapiUrl } from '$lib/api/client';

export interface FuneralHome {
  id: number;
  attributes: {
    name: string;
    [key: string]: any;
  };
}

export interface Package {
  id: number;
  attributes: {
    name: string;
    [key: string]: any;
  };
}

export interface FormErrors {
  lovedOnesFullName?: string;
  lovedOnesDOB?: string;
  lovedOnesDOD?: string;
  funeralHome?: string;
  package?: string;
  customHTML?: string;
  paymentComplete?: string;
  events?: string[];
  api?: string;
}

interface PageLoadEvent {
  locals: {
    user?: {
      id: number;
      jwt?: string;
      [key: string]: any;
    };
  };
}

export const load = async ({ locals }: PageLoadEvent) => {
  console.log('🔍 Loading tribute creator page data');
  
  try {
    // Fetch funeral homes
    const funeralHomesResponse = await apiFetch(
      getStrapiUrl('/api/funeral-homes?populate=*'),
      locals.user?.jwt
    );
    
    if (!funeralHomesResponse.ok) {
      console.error('❌ Failed to fetch funeral homes:', await funeralHomesResponse.text());
      return {
        funeralHomes: [],
        packages: [],
        error: 'Failed to load funeral homes. Please try again later.'
      };
    }
    
    const funeralHomesData = await funeralHomesResponse.json();
    const funeralHomes = funeralHomesData.data || [];

    // Fetch packages
    const packagesResponse = await apiFetch(
      getStrapiUrl('/api/packages?populate=*'),
      locals.user?.jwt
    );
    
    if (!packagesResponse.ok) {
      console.error('❌ Failed to fetch packages:', await packagesResponse.text());
      return {
        funeralHomes,
        packages: [],
        error: 'Failed to load packages. Please try again later.'
      };
    }
    
    const packagesData = await packagesResponse.json();
    const packages = packagesData.data || [];

    console.log(`✅ Loaded ${funeralHomes.length} funeral homes and ${packages.length} packages`);
    
    return {
      funeralHomes,
      packages,
      user: locals.user
    };
  } catch (error) {
    console.error('❌ Error loading tribute creator data:', error);
    return {
      funeralHomes: [],
      packages: [],
      error: 'An unexpected error occurred. Please try again later.'
    };
  }
};

export const actions = {
  default: async ({ request, locals }: { request: Request; locals: PageLoadEvent['locals'] }) => {
    console.log('🚀 Processing tribute creation form submission');
    
    // Parse form data
    const formData = await request.formData();
    const lovedOnesFullName = formData.get('lovedOnesFullName')?.toString() || '';
    const lovedOnesDOB = formData.get('lovedOnesDOB')?.toString() || '';
    const lovedOnesDOD = formData.get('lovedOnesDOD')?.toString() || '';
    const paymentComplete = formData.get('paymentComplete') === 'on';
    const customHTML = formData.get('customHTML')?.toString() || '';
    const funeralHomeId = formData.get('funeralHome')?.toString() || '';
    const packageId = formData.get('package')?.toString() || '';
    
    // Extract all event data
    const events: any[] = [];
    let currentEventIndex = 0;
    let hasMoreEvents = true;
    
    while (hasMoreEvents) {
      const eventName = formData.get(`events[${currentEventIndex}].eventName`)?.toString();
      
      if (!eventName) {
        hasMoreEvents = false;
        break;
      }
      
      events.push({
        eventName,
        locationName: formData.get(`events[${currentEventIndex}].locationName`)?.toString() || '',
        locationAddress: formData.get(`events[${currentEventIndex}].locationAddress`)?.toString() || '',
        startDate: formData.get(`events[${currentEventIndex}].startDate`)?.toString() || '',
        startTime: formData.get(`events[${currentEventIndex}].startTime`)?.toString() || '',
        endTime: formData.get(`events[${currentEventIndex}].endTime`)?.toString() || '',
        durationMinutes: parseInt(formData.get(`events[${currentEventIndex}].durationMinutes`)?.toString() || '60')
      });
      
      currentEventIndex++;
    }
    
    // Validate the form data
    const errors: FormErrors = {};
    let hasErrors = false;
    
    if (!lovedOnesFullName.trim()) {
      errors.lovedOnesFullName = 'Loved one\'s full name is required';
      hasErrors = true;
    }
    
    if (!lovedOnesDOB) {
      errors.lovedOnesDOB = 'Date of birth is required';
      hasErrors = true;
    }
    
    if (!lovedOnesDOD) {
      errors.lovedOnesDOD = 'Date of death is required';
      hasErrors = true;
    }
    
    if (!funeralHomeId) {
      errors.funeralHome = 'Funeral home is required';
      hasErrors = true;
    }
    
    if (!packageId) {
      errors.package = 'Package is required';
      hasErrors = true;
    }
    
    if (events.length === 0) {
      errors.events = ['At least one event is required'];
      hasErrors = true;
    }
    
    // Return errors if validation fails
    if (hasErrors) {
      console.error('❌ Form validation failed:', errors);
      return fail(400, { 
        errors,
        data: {
          lovedOnesFullName,
          lovedOnesDOB,
          lovedOnesDOD,
          paymentComplete,
          customHTML,
          funeralHomeId,
          packageId,
          events
        }
      });
    }
    
    try {
      // Prepare the payload for Strapi
      const tributeData = {
        data: {
          lovedOnesFullName,
          lovedOnesDOB,
          lovedOnesDOD,
          paymentComplete,
          customHTML,
          funeral_home: {
            connect: [{ id: parseInt(funeralHomeId) }]
          },
          package: {
            connect: [{ id: parseInt(packageId) }]
          },
          users_permissions_user: {
            connect: [{ id: locals.user?.id }]
          },
          events
        }
      };
      
      console.log('📦 Sending tribute data to API:', JSON.stringify(tributeData, null, 2));
      
      // Send the data to Strapi
      const response = await apiFetch(
        getStrapiUrl('/api/tributes'),
        locals.user?.jwt,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tributeData)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error creating tribute:', errorData);
        return fail(response.status, {
          errors: {
            api: 'Failed to create tribute. Please try again.'
          },
          data: {
            lovedOnesFullName,
            lovedOnesDOB,
            lovedOnesDOD,
            paymentComplete,
            customHTML,
            funeralHomeId,
            packageId,
            events
          }
        });
      }
      
      const result = await response.json();
      console.log('✅ Tribute created successfully:', result);
      
      // Redirect to the funeral director portal
      redirect(303, '/funeral-director-portal');
    } catch (error) {
      console.error('❌ Unexpected error creating tribute:', error);
      return fail(500, {
        errors: {
          api: 'An unexpected error occurred. Please try again.'
        },
        data: {
          lovedOnesFullName,
          lovedOnesDOB,
          lovedOnesDOD,
          paymentComplete,
          customHTML,
          funeralHomeId,
          packageId,
          events
        }
      });
    }
  }
};