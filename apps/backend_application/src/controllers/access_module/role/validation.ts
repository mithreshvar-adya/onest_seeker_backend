import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

// Base role schema
const baseRoleSchema = {
    name: z.string()
        .min(1, "Role name is required")
        .max(100, "Role name cannot exceed 100 characters"),
    description: z.string()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
    code: z.string()
        .min(1, "Role code is required")
        .max(50, "Role code cannot exceed 50 characters")
        .optional(),
    is_active: z.boolean()
        .default(true)
        .optional(),
    role_assign_module: z.array(z.object({
        module_id: z.string().min(1, "Module ID is required"),
        is_view: z.boolean().optional(),
        is_edit: z.boolean().optional(),
        is_delete: z.boolean().optional()
    })).optional()
};

// Create role schema
export const createRoleSchema = z.object({
    body: z.object({
        ...baseRoleSchema
    })
});

// Update role schema
export const updateRoleSchema = z.object({
    body: z.object({
        ...baseRoleSchema
    }).partial(),
    params: z.object({
        id: z.string().min(1, "Role ID is required")
    })
});

// List query parameters schema
export const listQuerySchema = z.object({
    query: z.object({
        search: z.string().optional(),
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
        id: z.string().min(1, "Role ID is required")
    })
});

// Find with role parameter schema
export const findWithRoleSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Role ID is required")
    })
});

// Delete parameter schema
export const deleteSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Role ID is required")
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