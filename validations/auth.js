import { body } from 'express-validator';

export const registerValidation = [
    body('email', 'Invalid Email').isEmail(),
    body('password', 'Password must be at least 5 characters long').isLength({ min: 5 }),
    body('fullName', 'Write fullname').isLength({ min: 3 }),
    body('avatarUrl', 'Invalid avatar link').optional().isURL(),
];