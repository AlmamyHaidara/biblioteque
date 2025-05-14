import { ZodError } from 'zod';
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    status: 'error',
                    message: 'Validation error',
                    errors,
                });
            }
            else {
                next(error);
            }
        }
    };
};
//# sourceMappingURL=validate.middleware.js.map