import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^\d{10}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// Base user schema with common fields
const baseUserSchema = {
    first_name: z.string().min(1, "First name is required").optional(),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required").optional(),
    email: z.string().regex(emailPattern, "Invalid email format").optional(),
    mobile_number: z.string().regex(mobilePattern, "Mobile number must be 10 digits").optional(),
    profile_image: z.string().url("Invalid profile image URL").optional(),
    dob: z.string().datetime("Invalid date format").optional(),
    language_preference: z.string().optional(),
    age: z.number().min(0).max(150).optional(),
    profession: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    nationality: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pincode: z.string().optional()
    }).optional(),
    is_active: z.boolean().optional(),
    status: z.string().optional()
};

// Login schema
export const loginSchema = z.object({
    body: z.object({
        login: z.string()
            .min(1, "Email or mobile number is required")
            .refine((val) => emailPattern.test(val) || mobilePattern.test(val), {
                message: "Invalid email or mobile number format"
            })
    })
});

// OTP verification schema
export const verifyOtpSchema = z.object({
    body: z.object({
        id: z.string().min(1, "User ID is required"),
        otp: z.string()
            .length(6, "OTP must be 6 digits")
            .regex(/^\d+$/, "OTP must contain only numbers")
    })
});

// Create user schema
export const createUserSchema = z.object({
    body: z.object({
        ...baseUserSchema,
        company_id: z.string().min(1, "Company ID is required")
    })
});

// Update user schema
export const updateUserSchema = z.object({
    body: z.object({
        ...baseUserSchema
    }).partial(),
    params: z.object({
        id: z.string().min(1, "User ID is required")
    })
});

// Profile update schema
export const updateProfileSchema = z.object({
    body: z.object({
        bank_details: z.object({
            account_number: z.string().optional(),
            ifsc_code: z.string().optional(),
            bank_name: z.string().optional(),
            branch_name: z.string().optional()
        }).optional(),
        // Add other profile-specific fields here
    }),
    params: z.object({
        id: z.string().min(1, "User ID is required")
    })
});

// Validation middleware
export const validate = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            console.log("Validation Error ===========>>>> ", error);
            return res.status(400).json({
                meta: {
                    status: false,
                    message: "Validation Failed",
                },
                error: error.errors || error,
            });
        }
    }; 