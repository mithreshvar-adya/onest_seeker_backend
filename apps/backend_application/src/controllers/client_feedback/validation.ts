import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

export const createSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: "Name is required",
            })
            .min(1, "Name is required"),
        email: z
            .string({
                required_error: "Email is required",
            })
            .email("Not a valid email"),
        mobile_number: z
            .string({
                required_error: "Mobile Number is required",
            })
            .regex(/^\d{10}$/, "Mobile Number must be 10 digits"),
        comments: z
            .string({
                required_error: "Comments is required",
            })
            .min(1, "Comments is required"),
    }),
});

export const updateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Not a valid email").optional(),
        mobile_number: z.string().regex(/^\d{10}$/, "Mobile Number must be 10 digits").optional(),
        comments: z.string().min(1, "Comments is required").optional(),
    }),
});

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
                    message: "Bad Request",
                },
                error: error,
            });
        }
    };