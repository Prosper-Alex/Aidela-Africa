// Key feature: Backward-compatible password reset email wrapper.
import { sendPasswordResetEmail } from "./emailService.js";

export const sendResetEmail = sendPasswordResetEmail;
