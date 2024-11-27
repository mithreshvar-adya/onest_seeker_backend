import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE: /^\d{10}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
} as const;

const addressSchema = z.union([
  z.string(),
  z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional()
  })
]);

const baseUserSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  email: z.string().regex(VALIDATION_PATTERNS.EMAIL, "Invalid email format").optional(),
  mobile_number: z.string().regex(VALIDATION_PATTERNS.MOBILE, "Mobile number must be 10 digits").optional(),
  profile_image: z.string().url("Invalid profile image URL").optional(),
  dob: z.string().datetime("Invalid date format").optional(),
  language_preference: z.string().optional(),
  age: z.number().min(0).max(150).optional(),
  profession: z.string().optional(),
  gender: z.object({
    label: z.string(),
    value: z.string()
  }).optional(),
  nationality: z.string().optional(),
  address: addressSchema.optional(),
  is_active: z.boolean().optional(),
  status: z.string().optional()
});

export const schemas = {
  login: z.object({
    body: z.object({
      login: z.string()
        .min(1, "Email or mobile number is required")
        .refine(val => VALIDATION_PATTERNS.EMAIL.test(val) || VALIDATION_PATTERNS.MOBILE.test(val), 
          "Invalid email or mobile number format")
    })
  }),

  verifyOtp: z.object({
    body: z.object({
      id: z.string().min(1, "User ID is required"),
      otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers")
    })
  }),

  createUser: z.object({
    body: baseUserSchema.extend({
      company_id: z.string().min(1, "Company ID is required")
    })
  }),

  updateUser: z.object({
    body: baseUserSchema.partial(),
    params: z.object({
      id: z.string().min(1, "User ID is required")
    })
  }),

  updateProfile: z.object({
    body: z.object({
      bank_details: z.object({
        account_number: z.string().optional(),
        ifsc_code: z.string().optional(),
        bank_name: z.string().optional(),
        branch_name: z.string().optional()
      }).optional()
    }),
    params: z.object({
      id: z.string().min(1, "User ID is required")
    })
  })
};

export const validate = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    console.error("Validation Error:", error);
    return res.status(400).json({
      meta: {
        status: false,
        message: "Validation Failed",
      },
      error: error.errors || error,
    });
  }
}; 