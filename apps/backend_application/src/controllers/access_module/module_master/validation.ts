import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

// Base module master schema
const baseModuleMasterSchema = {
    name: z.string()
        .min(1, "Module name is required")
        .max(100, "Module name cannot exceed 100 characters"),
    description: z.string()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters"),
    is_view: z.boolean()
        .default(false)
        .optional(),
    is_edit: z.boolean()
        .default(false)
        .optional(),
    is_delete: z.boolean()
        .default(false)
        .optional(),
    is_active: z.boolean()
        .default(true)
        .optional()
};

// Create module master schema
export const createModuleMasterSchema = z.object({
    body: z.object({
        ...baseModuleMasterSchema
    })
});

// Update module master schema
export const updateModuleMasterSchema = z.object({
    body: z.object({
        ...baseModuleMasterSchema
    }).partial(),
    params: z.object({
        id: z.string()
            .min(1, "Module ID is required")
    })
});

// List query parameters schema
export const listQuerySchema = z.object({
    query: z.object({
        page_no: z.string()
            .optional()
            .transform(val => val ? parseInt(val) : 1),
        per_page: z.string()
            .optional()
            .transform(val => val ? parseInt(val) : 10)
    })
});

// Get by ID parameter schema
export const getByIdSchema = z.object({
    params: z.object({
        id: z.string()
            .min(1, "Module ID is required")
    })
});

// Delete parameter schema
export const deleteSchema = z.object({
    params: z.object({
        id: z.string()
            .min(1, "Module ID is required")
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