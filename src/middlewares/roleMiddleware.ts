import { Response, NextFunction } from "express";
import { RequestWithUser } from "./auth";
import { Role } from "@prisma/client"; // ✅ Prisma থেকে Role ইম্পোর্ট করুন

/**
 * Middleware to restrict access based on user roles.
 * Usage: roleMiddleware("ADMIN") or roleMiddleware("ADMIN", "SELLER", "SUPER_ADMIN")
 */
export const roleMiddleware =
  (...roles: Role[]) => // ✅ হার্ডকোডেড লিস্টের বদলে সরাসরি Role এনাম ব্যবহার করুন
  (req: RequestWithUser, res: Response, next: NextFunction) => {
    
    // 1. Check if user exists (set by 'protect' middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: No user found in request" 
      });
    }

    // 2. Check if the user's role is included in the allowed roles
    // ✅ এখন TypeScript 'SUPER_ADMIN' কেও বৈধ হিসেবে গ্রহণ করবে
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: ${req.user.role} role is not permitted for this resource`,
      });
    }

    // 3. User is authorized, proceed to the controller
    next();
  };