import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

// Base role assign module schema
const baseRoleAssignModuleSchema = {
    role_id: z.string()
        .min(1, "Role ID is required"),
    module_id: z.string()
        .min(1, "Module ID is required"),
    is_view: z.boolean()
        .default(false)
        .optional(),
    is_edit: z.boolean()
        .default(false)
        .optional(),
    is_delete: z.boolean()
        .default(false)
        .optional()
};

// Create single role assign module schema
export const createRoleAssignModuleSchema = z.object({
    body: z.object({
        ...baseRoleAssignModuleSchema
    })
});

// Create bulk role assign modules schema
export const createBulkRoleAssignModuleSchema = z.object({
    body: z.array(
        z.object({
            ...baseRoleAssignModuleSchema
        })
    ).min(1, "At least one role assignment is required")
});

// Update role assign module schema
export const updateRoleAssignModuleSchema = z.object({
    body: z.array(
        z.object({
            ...baseRoleAssignModuleSchema,
            company_id: z.string().optional()
        })
    ).min(1, "At least one role assignment is required")
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
            .min(1, "Role assign module ID is required")
    })
});

// Delete parameter schema
export const deleteSchema = z.object({
    params: z.object({
        id: z.string()
            .min(1, "Role assign module ID is required")
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