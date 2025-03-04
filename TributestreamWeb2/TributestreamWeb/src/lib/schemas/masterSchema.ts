import { z } from 'zod';

// Define schemas for each section of the master store
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

const packageInfoSchema = z.object({
  selection: z.string().optional(),
  priceTotal: z.number().default(0)
}).partial();

const billingInfoSchema = z.object({
  firstName: z.string().min(1, "Billing first name is required"),
  lastName: z.string().min(1, "Billing last name is required"),
  address: z.string().min(1, "Billing address is required"),
  creditCardDetails: z.any().optional(),
  isPaymentComplete: z.boolean().default(false)
}).partial();

// The master schema combines all section schemas
export const masterSchema = z.object({
  directorInfo: directorInfoSchema,
  lovedOneInfo: lovedOneInfoSchema,
  userInfo: userInfoSchema,
  memorialInfo: memorialInfoSchema,
  liveStreamInfo: liveStreamInfoSchema,
  packageInfo: packageInfoSchema,
  billingInfo: billingInfoSchema
});

// Export type for TypeScript usage
export type MasterSchema = z.infer<typeof masterSchema>;

export default masterSchema;