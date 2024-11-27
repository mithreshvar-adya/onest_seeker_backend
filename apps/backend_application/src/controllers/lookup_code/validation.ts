import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

// Base lookup code schema
const baseLookupCodeSchema = {
    lookup_type_id: z.string().min(1, "Lookup type ID is required"),
    display_name: z.string().min(1, "Display name is required"),
    lookup_code: z.string().min(1, "Lookup code is required"),
    is_active: z.boolean().optional().default(true)
};

// Create lookup code schema
export const createLookupCodeSchema = z.object({
    body: z.object({
        ...baseLookupCodeSchema
    })
});

// Bulk create lookup codes schema
export const bulkCreateLookupCodeSchema = z.object({
    body: z.object({
        lookup_codes: z.array(z.object({
            ...baseLookupCodeSchema
        })).min(1, "At least one lookup code is required")
    })
});

// Update lookup code schema
export const updateLookupCodeSchema = z.object({
    body: z.object({
        ...baseLookupCodeSchema
    }).partial(),
    params: z.object({
        id: z.string().min(1, "Lookup code ID is required")
    })
});

// Environment variable schema
export const envSchema = z.object({
    body: z.object({
        CODE: z.string().min(1, "Environment code is required"),
        VALUE: z.string().min(1, "Environment value is required"),
        DESCRIPTION: z.string().optional()
    })
});

// Update environment variable schema
export const updateEnvSchema = z.object({
    body: z.object({
        CODE: z.string().min(1, "Environment code is required"),
        VALUE: z.string().optional(),
        DESCRIPTION: z.string().optional()
    })
});

// List query parameters schema
export const listQuerySchema = z.object({
    query: z.object({
        lookup_type: z.string().optional(),
        page_no: z.string().optional().transform(val => val ? parseInt(val) : 1),
        per_page: z.string().optional().transform(val => val ? parseInt(val) : 10)
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