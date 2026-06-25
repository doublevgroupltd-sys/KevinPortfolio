import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Validates req.body against a Zod schema. On success, replaces req.body
 * with the parsed (and therefore type-coerced/stripped) data.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed.",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    return next();
  };
}
