// Import MSW utilities
import { http, HttpResponse } from 'msw';
// In-memory mock data for JWT
const validTokens = new Map<string, { username: string; roles: string[] }>();

// Utility: Generate JWT token (simplified for mock purposes)
const generateJwtToken = (() => {
    let counter = 0;
    return () => `mock-jwt-token-${++counter}`;
})();


// In-memory mock data storage
const familyPOCs = new Map();
const tributePages = new Map();
const streams = new Map();
const payments = new Map();




// In-memory mock data
interface Tribute {
    id: number;
    user_id: number;
    loved_one_name: string;
    slug: string;
    custom_html: string;
}

interface Event {
    id: number;
    tribute_id: number;
    event_name: string;
    event_date: string;
    event_location: string;
    event_description: string;
}

interface Video {
    id: number;
    tribute_id: number;
    embed_code: string;
    position: number;
    title: string;
    description: string;
}

const tributes = new Map<number, Tribute>();
const events = new Map<number, Event[]>();
const videos = new Map<number, Video[]>();
let currentUser: { username: string; roles: string[] } | null = null;

// Utility: Generate unique IDs
const generateId = (() => {
    let id = 0;
    return () => ++id;
})();

// Request body interfaces
interface LoginRequestBody {
    username: string;
    password: string;
}

interface CreateTributeRequest {
    user_id: number;
    loved_one_name: string;
    slug: string;
}

interface CreateEventRequest {
    tribute_id: number;
    event_name: string;
    event_date: string;
    event_location: string;
    event_description: string;
}

interface CreateVideoRequest {
    tribute_id: number;
    embed_code: string;
    position: number;
    title: string;
    description: string;
}

// Handlers
export const handlers = [
    // === AUTHENTICATION ===

    // Login Handler
    http.post<LoginRequestBody>('/custom/v1/login', async ({ request }) => {
        const { username, password } = await request.json();

        // Simulate authentication logic
        if (username === 'admin' && password === 'password') {
            const token = `mock-jwt-token-${generateId()}`;
            currentUser = { username, roles: ['administrator'] };
            console.log('Login successful for:', username);
            return HttpResponse.json({ message: 'Login successful', token, roles: currentUser.roles });
        } else {
            console.error('Invalid login attempt:', { username, password });
            return HttpResponse.json({ message: 'Invalid username or password' }, { status: 401 });
        }
    }),

    // === TRIBUTES ===

    // Fetch All Tributes
    http.get('/tributestream/v1/tribute', () => {
        console.log('Fetching all tributes');
        return HttpResponse.json(Array.from(tributes.values()));
    }),

    // Fetch Tribute by Slug
    http.get('/tributestream/v1/tribute/:slug', ({ params }) => {
        const { slug } = params;
        const tribute = Array.from(tributes.values()).find((t) => t.slug === slug);

        if (!tribute) {
            console.error(`Tribute not found for slug: ${slug}`);
            return HttpResponse.json({ message: 'Tribute not found' }, { status: 404 });
        }

        console.log('Fetching tribute:', tribute);
        return HttpResponse.json(tribute);
    }),

    // Create Tribute
    http.post<CreateTributeRequest>('/tributestream/v1/tribute', async ({ request }) => {
        const { user_id, loved_one_name, slug } = await request.json();
        const id = generateId();

        const newTribute: Tribute = { id, user_id, loved_one_name, slug, custom_html: '' };
        tributes.set(id, newTribute);

        console.log('Tribute created:', newTribute);
        return HttpResponse.json(newTribute, { status: 201 });
    }),

    // Update Tribute
    http.put('/tributestream/v1/tribute/:id', async ({ params, request }) => {
        const { id } = params;
        const tribute = tributes.get(Number(id));

        if (!tribute) {
            console.error(`Tribute not found for ID: ${id}`);
            return HttpResponse.json({ message: 'Tribute not found' }, { status: 404 });
        }

        const updates = await request.json();
        Object.assign(tribute, updates);

        console.log('Tribute updated:', tribute);
        return HttpResponse.json(tribute);
    }),

    // Delete Tribute
    http.delete('/tributestream/v1/tribute/:id', ({ params }) => {
        const { id } = params;

        if (!tributes.has(Number(id))) {
            console.error(`Tribute not found for ID: ${id}`);
            return HttpResponse.json({ message: 'Tribute not found' }, { status: 404 });
        }

        tributes.delete(Number(id));
        console.log('Tribute deleted:', id);
        return HttpResponse.json({ message: 'Tribute deleted' });
    }),

    // === EVENTS ===

    // Fetch Events for Tribute
    http.get('/tributestream/v1/tribute/:tribute_id/events', ({ params }) => {
        const { tribute_id } = params;
        const tributeEvents = events.get(Number(tribute_id)) || [];

        console.log('Fetching events for tribute:', tribute_id);
        return HttpResponse.json(tributeEvents);
    }),

    // Create Event
    http.post<CreateEventRequest>('/tributestream/v1/tribute-event', async ({ request }) => {
        const { tribute_id, event_name, event_date, event_location, event_description } = await request.json();
        const eventId = generateId();

        const newEvent: Event = { id: eventId, tribute_id, event_name, event_date, event_location, event_description };
        if (!events.has(tribute_id)) events.set(tribute_id, []);
        events.get(tribute_id)!.push(newEvent);

        console.log('Event created:', newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
    }),

    // === VIDEOS ===

    // Fetch Videos for Tribute
    http.get('/tributestream/v1/tribute/:tribute_id/videos', ({ params }) => {
        const { tribute_id } = params;
        const tributeVideos = videos.get(Number(tribute_id)) || [];

        console.log('Fetching videos for tribute:', tribute_id);
        return HttpResponse.json(tributeVideos);
    }),

    // Create Video
    http.post<CreateVideoRequest>('/tributestream/v1/tribute/video', async ({ request }) => {
        const { tribute_id, embed_code, position, title, description } = await request.json();
        const videoId = generateId();

        const newVideo: Video = { id: videoId, tribute_id, embed_code, position, title, description };
        if (!videos.has(tribute_id)) videos.set(tribute_id, []);
        videos.get(tribute_id)!.push(newVideo);

        console.log('Video created:', newVideo);
        return HttpResponse.json(newVideo, { status: 201 });
    }),
    // === AUTHENTICATION: TOKEN ===

    // Authenticate and return JWT
    http.post('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', async ({ request }) => {
        const { username, password } = await request.json();

        // Simulate authentication logic
        if (username === 'admin' && password === 'password') {
            const token = generateJwtToken();
            validTokens.set(token, { username, roles: ['administrator'] });
            console.log(`JWT generated for user "${username}"`, { token });
            return HttpResponse.json({ token, user_nicename: username, roles: ['administrator'] });
        } else {
            console.error('Invalid login attempt for JWT:', { username });
            return HttpResponse.json(
                { code: 'invalid_credentials', message: 'Invalid username or password' },
                { status: 403 }
            );
        }
    }),

    // === VALIDATION ===

    // Validate JWT token
    http.post('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token && validTokens.has(token)) {
            console.log(`JWT validated: ${token}`);
            return HttpResponse.json({ message: 'Token is valid', data: { valid: true } });
        } else {
            console.error(`Invalid or missing token: ${authHeader}`);
            return HttpResponse.json(
                { code: 'invalid_token', message: 'The token is invalid or expired' },
                { status: 401 }
            );
        }
    }),

    // === Family POCs Handlers ===
    http.get('/custom/v1/family-pocs', () => {
        console.log('Fetching all family POCs');
        return HttpResponse.json(Array.from(familyPOCs.values()));
    }),
    http.post('/custom/v1/family-pocs', async ({ request }) => {
        const { name, email, phone, address } = await request.json();
        const id = generateId();
        const newPOC = { id, name, email, phone, address };
        familyPOCs.set(id, newPOC);
        console.log('Created Family POC:', newPOC);
        return HttpResponse.json(newPOC, { status: 201 });
    }),
    http.put('/custom/v1/family-pocs/:id', async ({ params, request }) => {
        const { id } = params;
        const updates = await request.json();
        const poc = familyPOCs.get(Number(id));
        if (!poc) {
            return new HttpResponse({ message: 'POC not found' }, { status: 404 });
        }
        Object.assign(poc, updates);
        console.log('Updated Family POC:', poc);
        return HttpResponse.json(poc);
    }),
    http.delete('/custom/v1/family-pocs/:id', ({ params }) => {
        const { id } = params;
        if (!familyPOCs.has(Number(id))) {
            return new HttpResponse({ message: 'POC not found' }, { status: 404 });
        }
        familyPOCs.delete(Number(id));
        console.log('Deleted Family POC:', id);
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // === Tribute Pages Handlers ===
    http.get('/custom/v1/tribute-pages', () => {
        console.log('Fetching all tribute pages');
        return HttpResponse.json(Array.from(tributePages.values()));
    }),
    http.post('/custom/v1/tribute-pages', async ({ request }) => {
        const { event_name, event_address, livestream_url, page_status } = await request.json();
        const id = generateId();
        const newPage = { id, event_name, event_address, livestream_url, page_status };
        tributePages.set(id, newPage);
        console.log('Created Tribute Page:', newPage);
        return HttpResponse.json(newPage, { status: 201 });
    }),
    http.put('/custom/v1/tribute-pages/:id', async ({ params, request }) => {
        const { id } = params;
        const updates = await request.json();
        const page = tributePages.get(Number(id));
        if (!page) {
            return new HttpResponse({ message: 'Page not found' }, { status: 404 });
        }
        Object.assign(page, updates);
        console.log('Updated Tribute Page:', page);
        return HttpResponse.json(page);
    }),
    http.delete('/custom/v1/tribute-pages/:id', ({ params }) => {
        const { id } = params;
        if (!tributePages.has(Number(id))) {
            return new HttpResponse({ message: 'Page not found' }, { status: 404 });
        }
        tributePages.delete(Number(id));
        console.log('Deleted Tribute Page:', id);
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // === Streams Handlers ===
    http.get('/custom/v1/streams', ({ request }) => {
        const pageId = request.url.searchParams.get('page_id');
        if (!pageId) {
            return new HttpResponse({ message: 'Page ID is required' }, { status: 400 });
        }
        const pageStreams = streams.get(Number(pageId)) || [];
        console.log('Fetching streams for page:', pageId);
        return HttpResponse.json(pageStreams);
    }),
    http.post('/custom/v1/streams', async ({ request }) => {
        const { page_id, stream_status, start_time, end_time, stream_order, stream_title, stream_url } =
            await request.json();
        const id = generateId();
        const newStream = {
            id,
            page_id,
            stream_status,
            start_time,
            end_time,
            stream_order,
            stream_title,
            stream_url,
        };
        if (!streams.has(page_id)) streams.set(page_id, []);
        streams.get(page_id).push(newStream);
        console.log('Created Stream:', newStream);
        return HttpResponse.json(newStream, { status: 201 });
    }),
    http.put('/custom/v1/streams/:id', async ({ params, request }) => {
        const { id } = params;
        const updates = await request.json();
        let streamToUpdate = null;
        for (const streamList of streams.values()) {
            streamToUpdate = streamList.find((stream) => stream.id === Number(id));
            if (streamToUpdate) break;
        }
        if (!streamToUpdate) {
            return new HttpResponse({ message: 'Stream not found' }, { status: 404 });
        }
        Object.assign(streamToUpdate, updates);
        console.log('Updated Stream:', streamToUpdate);
        return HttpResponse.json(streamToUpdate);
    }),
    http.delete('/custom/v1/streams/:id', ({ params }) => {
        const { id } = params;
        let deleted = false;
        for (const [pageId, streamList] of streams.entries()) {
            const index = streamList.findIndex((stream) => stream.id === Number(id));
            if (index !== -1) {
                streamList.splice(index, 1);
                deleted = true;
                console.log('Deleted Stream:', id);
                break;
            }
        }
        if (!deleted) {
            return new HttpResponse({ message: 'Stream not found' }, { status: 404 });
        }
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),

    // === Payments Handlers ===
    http.get('/custom/v1/payments', ({ request }) => {
        const pageId = request.url.searchParams.get('page_id');
        if (!pageId) {
            return new HttpResponse({ message: 'Page ID is required' }, { status: 400 });
        }
        const pagePayments = payments.get(Number(pageId)) || [];
        console.log('Fetching payments for page:', pageId);
        return HttpResponse.json(pagePayments);
    }),
    http.post('/custom/v1/payments', async ({ request }) => {
        const { page_id, payment_status, payment_method, transaction_id, amount, currency, payment_date } =
            await request.json();
        const id = generateId();
        const newPayment = {
            id,
            page_id,
            payment_status,
            payment_method,
            transaction_id,
            amount,
            currency,
            payment_date,
        };
        if (!payments.has(page_id)) payments.set(page_id, []);
        payments.get(page_id).push(newPayment);
        console.log('Created Payment:', newPayment);
        return HttpResponse.json(newPayment, { status: 201 });
    }),
    http.put('/custom/v1/payments/:id', async ({ params, request }) => {
        const { id } = params;
        const updates = await request.json();
        let paymentToUpdate = null;
        for (const paymentList of payments.values()) {
            paymentToUpdate = paymentList.find((payment) => payment.id === Number(id));
            if (paymentToUpdate) break;
        }
        if (!paymentToUpdate) {
            return new HttpResponse({ message: 'Payment not found' }, { status: 404 });
        }
        Object.assign(paymentToUpdate, updates);
        console.log('Updated Payment:', paymentToUpdate);
        return HttpResponse.json(paymentToUpdate);
    }),
    http.delete('/custom/v1/payments/:id', ({ params }) => {
        const { id } = params;
        let deleted = false;
        for (const [pageId, paymentList] of payments.entries()) {
            const index = paymentList.findIndex((payment) => payment.id === Number(id));
            if (index !== -1) {
                paymentList.splice(index, 1);
                deleted = true;
                console.log('Deleted Payment:', id);
                break;
            }
        }
        if (!deleted) {
            return new HttpResponse({ message: 'Payment not found' }, { status: 404 });
        }
        return HttpResponse.json({ message: 'Deleted successfully' });
    }),
];
