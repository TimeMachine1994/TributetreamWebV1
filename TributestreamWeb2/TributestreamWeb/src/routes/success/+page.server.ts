import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      // Extract form data
      const formData = await request.formData();

      const body = {
        directorFirstName: formData.get('director-first-name'),
        directorLastName: formData.get('director-last-name'),
        familyMemberFirstName: formData.get('family-member-first-name'),
        familyMemberLastName: formData.get('family-member-last-name'),
        familyMemberDOB: formData.get('family-member-dob'),
        deceasedFirstName: formData.get('deceased-first-name'),
        deceasedLastName: formData.get('deceased-last-name'),
        deceasedDOB: formData.get('deceased-dob'),
        deceasedDOP: formData.get('deceased-dop'),
        email: formData.get('email-address'),
        phone: formData.get('phone-number'),
        locationName: formData.get('location-name'),
        locationAddress: formData.get('location-address'),
        memorialTime: formData.get('memorial-time'),
        memorialDate: formData.get('memorial-date'),
      };

      // Extract the JWT token from cookies
      const jwtToken = cookies.get('jwt_token');
      if (!jwtToken) {
        return {
          status: 403,
          errors: { message: 'Unauthorized: Missing JWT token' }
        };
      }

      // Make the request to the WordPress REST API
      const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify(body)
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          status: response.status,
          errors: { message: responseData }
        };
      }

      return { status: 200, body: responseData };
    } catch (error) {
      console.error('Error in API call:', error);
      return { status: 500, errors: { message: 'Internal server error' } };
    }
  }
};
