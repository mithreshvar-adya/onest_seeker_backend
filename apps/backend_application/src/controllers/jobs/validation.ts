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

// Job filters schema
const jobFiltersSchema = {
    job_name: z.string().optional(),
    job_role: z.string().optional(),
    employment_type: z.string().optional(),
    job_fulfilment_type: z.string().optional(),
    min_salary: z.string()
        .optional()
        .transform(val => val ? parseFloat(val) : undefined),
    max_salary: z.string()
        .optional()
        .transform(val => val ? parseFloat(val) : undefined),
    provider_descriptor: z.string().optional(),
    is_saved_job: z.string().optional()
};

// Job application form schema
const jobApplicationFormSchema = z.object({
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.number()
    })).optional(),
    experience: z.array(z.object({
        company: z.string(),
        role: z.string(),
        duration: z.number()
    })).optional(),
    skills: z.array(z.string()).optional(),
    resume_url: z.string().url("Invalid resume URL").optional(),
    cover_letter: z.string().optional()
});

// List Jobs Schema
export const listJobsSchema = z.object({
    query: z.object({
        ...paginationSchema,
        ...jobFiltersSchema
    })
});

// Get Job Detail Schema
export const getJobDetailSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Job ID is required")
    })
});

// Save Job Schema
export const saveJobSchema = z.object({
    query: z.object({
        job_id: z.string().min(1, "Job ID is required"),
        type: z.enum(['save', 'unsave'], {
            errorMap: () => ({ message: "Type must be either 'save' or 'unsave'" })
        })
    })
});

// Apply Job Schema
export const applyJobSchema = z.object({
    body: z.object({
        job_id: z.string().min(1, "Job ID is required"),
        job_application_form: jobApplicationFormSchema
    })
});

// Admin List Jobs Schema
export const adminListJobsSchema = z.object({
    query: z.object({
        ...paginationSchema,
        status: z.string().optional(),
        provider_id: z.string().optional()
    })
});

// Get Job Order Schema
export const getJobOrderSchema = z.object({
    params: z.object({
        transaction_id: z.string().min(1, "Transaction ID is required")
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