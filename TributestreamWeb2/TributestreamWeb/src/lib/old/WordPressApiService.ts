// src/lib/services/WordPressApiService.ts

import type { RequestEvent } from '@sveltejs/kit';
import { fetchWithAuth } from './utils/fetchWithAuth';

// Define the base URL for your WordPress API
const WORDPRESS_API_BASE_URL = 'https://wp.tributestream.com/wp-json/custom/v1';

// Data Models

export interface FamilyPOCProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: number;
  address: string;
}

export interface TributePage {
  id: number;
  user_id: number;
  event_name: string;
  event_address: string;
  livestream_url: string;
  page_status: string;
}

export interface Stream {
  id: number;
  page_id: number;
  stream_status: number;
  start_time: string;
  end_time: string;
  stream_order: number;
  stream_title: string;
  stream_url: string;
}

export interface Payment {
  id: number;
  user_id: number;
  page_id: number;
  payment_status: string;
  payment_method: string;
  transaction_id: string;
  amount: string;
  currency: string;
  payment_date: string;
}

// WordPressApiService Class

export class WordPressApiService {
  private event: RequestEvent;

  constructor(event: RequestEvent) {
    this.event = event;
  }

  // FamilyPOCProfiles

  public async getAllFamilyPOCProfiles(): Promise<FamilyPOCProfile[]> {
    console.log('Fetching all Family POC Profiles');
    const url = `${WORDPRESS_API_BASE_URL}/family-pocs`;

    const response = await fetchWithAuth(url, { method: 'GET' }, this.event);
    const data = await response.json();
    console.log('Received Family POC Profiles:', data);
    return data;
  }

  public async createFamilyPOCProfile(profile: Omit<FamilyPOCProfile, 'id' | 'user_id'>): Promise<FamilyPOCProfile> {
    console.log('Creating Family POC Profile:', profile);
    const url = `${WORDPRESS_API_BASE_URL}/family-pocs`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'POST',
        body: JSON.stringify(profile),
      },
      this.event
    );
    const data = await response.json();
    console.log('Created Family POC Profile:', data);
    return data;
  }

  public async updateFamilyPOCProfile(id: number, profile: Partial<FamilyPOCProfile>): Promise<FamilyPOCProfile> {
    console.log(`Updating Family POC Profile with ID ${id}:`, profile);
    const url = `${WORDPRESS_API_BASE_URL}/family-pocs/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(profile),
      },
      this.event
    );
    const data = await response.json();
    console.log('Updated Family POC Profile:', data);
    return data;
  }

  public async deleteFamilyPOCProfile(id: number): Promise<{ message: string }> {
    console.log(`Deleting Family POC Profile with ID ${id}`);
    const url = `${WORDPRESS_API_BASE_URL}/family-pocs/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'DELETE',
      },
      this.event
    );
    const data = await response.json();
    console.log('Deleted Family POC Profile:', data);
    return data;
  }

  // TributePages

  public async getAllTributePages(): Promise<TributePage[]> {
    console.log('Fetching all Tribute Pages');
    const url = `${WORDPRESS_API_BASE_URL}/tribute-pages`;

    const response = await fetchWithAuth(url, { method: 'GET' }, this.event);
    const data = await response.json();
    console.log('Received Tribute Pages:', data);
    return data;
  }

  public async createTributePage(page: Omit<TributePage, 'id' | 'user_id'>): Promise<TributePage> {
    console.log('Creating Tribute Page:', page);
    const url = `${WORDPRESS_API_BASE_URL}/tribute-pages`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'POST',
        body: JSON.stringify(page),
      },
      this.event
    );
    const data = await response.json();
    console.log('Created Tribute Page:', data);
    return data;
  }

  public async updateTributePage(id: number, page: Partial<TributePage>): Promise<TributePage> {
    console.log(`Updating Tribute Page with ID ${id}:`, page);
    const url = `${WORDPRESS_API_BASE_URL}/tribute-pages/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(page),
      },
      this.event
    );
    const data = await response.json();
    console.log('Updated Tribute Page:', data);
    return data;
  }

  public async deleteTributePage(id: number): Promise<{ message: string }> {
    console.log(`Deleting Tribute Page with ID ${id}`);
    const url = `${WORDPRESS_API_BASE_URL}/tribute-pages/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'DELETE',
      },
      this.event
    );
    const data = await response.json();
    console.log('Deleted Tribute Page:', data);
    return data;
  }

  // Streams

  public async getAllStreams(page_id: number): Promise<Stream[]> {
    console.log(`Fetching all Streams for Page ID ${page_id}`);
    const url = `${WORDPRESS_API_BASE_URL}/streams?page_id=${page_id}`;

    const response = await fetchWithAuth(url, { method: 'GET' }, this.event);
    const data = await response.json();
    console.log('Received Streams:', data);
    return data;
  }

  public async createStream(stream: Omit<Stream, 'id'>): Promise<Stream> {
    console.log('Creating Stream:', stream);
    const url = `${WORDPRESS_API_BASE_URL}/streams`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'POST',
        body: JSON.stringify(stream),
      },
      this.event
    );
    const data = await response.json();
    console.log('Created Stream:', data);
    return data;
  }

  public async updateStream(id: number, stream: Partial<Stream>): Promise<Stream> {
    console.log(`Updating Stream with ID ${id}:`, stream);
    const url = `${WORDPRESS_API_BASE_URL}/streams/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(stream),
      },
      this.event
    );
    const data = await response.json();
    console.log('Updated Stream:', data);
    return data;
  }

  public async deleteStream(id: number): Promise<{ message: string }> {
    console.log(`Deleting Stream with ID ${id}`);
    const url = `${WORDPRESS_API_BASE_URL}/streams/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'DELETE',
      },
      this.event
    );
    const data = await response.json();
    console.log('Deleted Stream:', data);
    return data;
  }

  // Payments

  public async getPaymentsForPage(page_id: number): Promise<Payment[]> {
    console.log(`Fetching all Payments for Page ID ${page_id}`);
    const url = `${WORDPRESS_API_BASE_URL}/payments?page_id=${page_id}`;

    const response = await fetchWithAuth(url, { method: 'GET' }, this.event);
    const data = await response.json();
    console.log('Received Payments:', data);
    return data;
  }

  public async createPayment(payment: Omit<Payment, 'id' | 'user_id'>): Promise<Payment> {
    console.log('Creating Payment:', payment);
    const url = `${WORDPRESS_API_BASE_URL}/payments`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'POST',
        body: JSON.stringify(payment),
      },
      this.event
    );
    const data = await response.json();
    console.log('Created Payment:', data);
    return data;
  }

  public async updatePayment(id: number, payment: Partial<Payment>): Promise<Payment> {
    console.log(`Updating Payment with ID ${id}:`, payment);
    const url = `${WORDPRESS_API_BASE_URL}/payments/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(payment),
      },
      this.event
    );
    const data = await response.json();
    console.log('Updated Payment:', data);
    return data;
  }

  public async deletePayment(id: number): Promise<{ message: string }> {
    console.log(`Deleting Payment with ID ${id}`);
    const url = `${WORDPRESS_API_BASE_URL}/payments/${id}`;

    const response = await fetchWithAuth(
      url,
      {
        method: 'DELETE',
      },
      this.event
    );
    const data = await response.json();
    console.log('Deleted Payment:', data);
    return data;
  }

  // Duplicate Prevention for Memorial Links

  public async checkDuplicateMemorialLink(slug: string): Promise<boolean> {
    console.log(`Checking for duplicate memorial link: ${slug}`);
    // Implement the logic to check for duplicates
    // This might involve making a GET request to an endpoint that returns existing slugs
    const url = `${WORDPRESS_API_BASE_URL}/tribute-pages?slug=${encodeURIComponent(slug)}`;

    const response = await fetchWithAuth(url, { method: 'GET' }, this.event);
    const data: TributePage[] = await response.json();
    const isDuplicate = data.length > 0;
    console.log(`Is duplicate: ${isDuplicate}`);
    return isDuplicate;
  }

  // Media Upload Methods (Stubbed for CloudFlare integration)

  public async uploadMedia(file: File): Promise<string> {
    console.log('Uploading media file:', file.name);
    // Implement the logic to upload media to CloudFlare or your storage solution
    // This is a placeholder implementation
    // You may need to use a different fetch function or library for file uploads

    const url = 'https://api.cloudflare.com/client/v4/accounts/{account_id}/media';

    const formData = new FormData();
    formData.append('file', file);

    // Adjust fetchWithAuth if needed to handle FormData
    const response = await fetchWithAuth(
      url,
      {
        method: 'POST',
        body: formData,
        // Note: fetchWithAuth may need to be adjusted to handle FormData and appropriate headers
      },
      this.event
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Media upload error:', errorData);
      throw new Error(`Media upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Uploaded media:', data);

    // Return the media URL or ID
    return data.result.uid;
  }
}
