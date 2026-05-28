import { z } from "zod";

const phoneRegex = /^$|^[\d\s+()-]{7,20}$/;
const adiRegex = /^$|^ADI\s?\d{1,6}$/i;

export const pupilRegistrationSchema = z.object({
  token: z.string().min(1, "Token is required."),
  firstName: z.string().min(1, "First name is required.").max(60),
  lastName: z.string().min(1, "Last name is required.").max(60),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number.").min(7, "Enter a valid phone number."),
  licenceNumber: z.string().max(30).optional(),
  lessonType: z.enum(["manual", "automatic", "no-preference"]).optional(),
  password: z.string().min(10, "Choose a password with at least 10 characters."),
  confirmPassword: z.string().min(10, "Confirm your password."),
  termsAccepted: z.literal("on", { errorMap: () => ({ message: "You must accept the terms to continue." }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Password confirmation does not match.",
  path: ["confirmPassword"],
});

export const instructorRegistrationSchema = z.object({
  token: z.string().min(1, "Token is required."),
  firstName: z.string().min(1, "First name is required.").max(60),
  lastName: z.string().min(1, "Last name is required.").max(60),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number.").min(7, "Enter a valid phone number."),
  adiNumber: z.string().regex(adiRegex, "Enter a valid ADI number (e.g. ADI 12345).").optional(),
  vehicleMake: z.string().max(60).optional(),
  vehicleModel: z.string().max(60).optional(),
  vehicleRegistration: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  password: z.string().min(10, "Choose a password with at least 10 characters."),
  confirmPassword: z.string().min(10, "Confirm your password."),
  termsAccepted: z.literal("on", { errorMap: () => ({ message: "You must accept the terms to continue." }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Password confirmation does not match.",
  path: ["confirmPassword"],
});

export type PupilRegistrationData = z.infer<typeof pupilRegistrationSchema>;
export type InstructorRegistrationData = z.infer<typeof instructorRegistrationSchema>;