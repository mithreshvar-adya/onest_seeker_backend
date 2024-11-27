import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

// Common schemas
const paginationSchema = {
    page_no: z.string()
        .optional()
        .transform(val => val ? parseInt(val) : 1),
    per_page: z.string()
        .optional()
        .transform(val => val ? parseInt(val) : 10)
};

const sortingSchema = {
    sort_by: z.enum(['price', 'ratings', 'name']).optional(),
    order: z.enum(['asc', 'desc']).optional()
};

// Course list filters schema
const courseFiltersSchema = {
    topics: z.string().optional(),
    providers: z.string().optional(),
    minPrice: z.string()
        .optional()
        .transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string()
        .optional()
        .transform(val => val ? parseFloat(val) : undefined),
    learner_level: z.string().optional(),
    course_name: z.string().optional(),
    status: z.string().optional(),
    payment_status: z.string().optional(),
    is_certificate_available: z.boolean().optional()
};

// List Cache Courses Schema
export const listCacheCoursesSchema = z.object({
    query: z.object({
        ...paginationSchema,
        ...sortingSchema,
        ...courseFiltersSchema
    })
});

// My Courses List Schema
export const listMyCoursesSchema = z.object({
    query: z.object({
        ...paginationSchema,
        ...sortingSchema,
        status: z.string().optional(),
        payment_status: z.string().optional(),
        is_certificate_available: z.boolean().optional()
    })
});

// Save Course Schema
export const saveCourseSchema = z.object({
    query: z.object({
        course_id: z.string().min(1, "Course ID is required"),
        type: z.enum(['save', 'unsave'], {
            errorMap: () => ({ message: "Type must be either 'save' or 'unsave'" })
        })
    })
});

// Get Course Detail Schema
export const getCourseDetailSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Course ID is required")
    })
});

// Course Enrollment Schema
export const enrollCourseSchema = z.object({
    body: z.object({
        course_id: z.string().min(1, "Course ID is required"),
        provider_id: z.string().min(1, "Provider ID is required"),
        billing: z.object({
            name: z.string().min(1, "Billing name is required"),
            email: z.string().email("Invalid email format"),
            phone: z.string().min(10, "Invalid phone number"),
            address: z.string().min(1, "Billing address is required")
        })
    })
});

// Payment Schema
export const paymentSchema = z.object({
    body: z.object({
        order_id: z.string().min(1, "Order ID is required"),
        payment_status: z.string().min(1, "Payment status is required"),
        transaction_id: z.string().optional()
    })
});

// Admin List Courses Schema
export const adminListCoursesSchema = z.object({
    query: z.object({
        ...paginationSchema,
        ...sortingSchema,
        status: z.string().optional(),
        provider_id: z.string().optional()
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