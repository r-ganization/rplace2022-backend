// import { Request, Response, NextFunction } from 'express';
// import { AnyZodObject } from 'zod';

// const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
//     try {
//         schema.parse({
//             body: req.body,
//             query: req.query,
//             params: req.params
//         });
//         next();
//     } catch (error: unknown) {
//         return res.status(400).send(error)
//     }
// }

// export default validate;