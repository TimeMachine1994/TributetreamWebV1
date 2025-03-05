import { z } from 'zod';

// --------- Original schemas from masterSchema.ts ---------

const directorInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  funeralHomeName: z.string().min(1, "Funeral home name is required"),
  funeralHomeAddress: z.string().min(1, "Funeral home address is required")
}).partial();

const lovedOneInfoSchema = z.object({
  fullName: z.string().min(1, "Loved one's full name is required"),
  dateOfBirth: z.string().optional(),
  dateOfPassing: z.string().optional()
}).partial();

const userInfoSchema = z.object({
  fullName: z.string().min(1, "User's full name is required"),
  emailAddress: z.string().email("Valid email address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().optional()
}).partial();

const memorialLocationSchema = z.object({
  name: z.string(),
  address: z.string()
});

const extendedMemorialLocationSchema = memorialLocationSchema.extend({
  travelExceedsHour: z.boolean(),
  startTime: z.string(),
  duration: z.number(),
  notes: z.string()
});

const scheduleDaySchema = z.object({
  date: z.string(),
  locations: z.array(extendedMemorialLocationSchema)
});

const memorialInfoSchema = z.object({
  locations: z.array(memorialLocationSchema).default([{ name: '', address: '' }]),
  startTime: z.string().optional(),
  date: z.string().optional()
}).partial();

const liveStreamInfoSchema = z.object({
  duration: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().optional()
}).partial();

const cartItemSchema = z.object({
  name: z.string(),
  price: z.number()
});

const packageInfoSchema = z.object({
  selection: z.string().optional(),
  priceTotal: z.number().default(0),
  items: z.array(cartItemSchema).optional()
}).partial();

const billingInfoSchema = z.object({
  firstName: z.string().min(1, "Billing first name is required"),
  lastName: z.string().min(1, "Billing last name is required"),
  address: z.string().min(1, "Billing address is required"),
  creditCardDetails: z.any().optional(),
  isPaymentComplete: z.boolean().default(false)
}).partial();

// --------- New schemas for tribute-related data ---------

const tributeSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  slug: z.string(),
  description: z.string().optional(),
  memorialDate: z.string().optional(),
  memorialLocation: z.string().optional(),
  custom_html: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_name: z.string().optional(),
  user_email: z.string().optional(),
  user_phone: z.string().optional(),
}).partial();

const tributeSearchResultsSchema = z.object({
  tributes: z.array(tributeSchema),
  total_pages: z.number(),
  currentPage: z.number(),
  isLoading: z.boolean(),
  error: z.string().nullable()
});

// --------- Unified schema combining all elements ---------

export const unifiedSchema = z.object({
  // Master store elements
  directorInfo: directorInfoSchema,
  lovedOneInfo: lovedOneInfoSchema,
  userInfo: userInfoSchema,
  memorialInfo: memorialInfoSchema,
  liveStreamInfo: liveStreamInfoSchema,
  packageInfo: packageInfoSchema,
  billingInfo: billingInfoSchema,
  scheduleDays: z.array(scheduleDaySchema).optional(),
  
  // Tribute page store elements
  currentTribute: tributeSchema,
  searchResults: tributeSearchResultsSchema.optional(),
  recentTributes: z.array(tributeSchema).optional(),
  authToken: z.string().nullable().optional()
});

// Export type for TypeScript usage
export type UnifiedSchema = z.infer<typeof unifiedSchema>;

export default unifiedSchema;