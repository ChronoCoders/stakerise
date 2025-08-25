import { z } from "zod";

export const kycDocumentSchema = z.object({
  document_type: z.enum([
    "passport",
    "drivers_license",
    "national_id",
    "proof_of_address",
  ]),
  document_number: z.string().min(1, "Document number is required"),
  issuing_country: z.string().min(1, "Issuing country is required"),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export const stakeFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be greater than 0",
    ),
  tokenType: z.number(),
  duration: z.number(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms"),
});

export const unstakeFormSchema = z.object({
  stakeIndex: z.number(),
  acceptPenalty: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must accept the early unstaking penalty",
    ),
});

export const withdrawFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be greater than 0",
    ),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});
