import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { Role } from "@prisma/client"; // ✅ Prisma থেকে Role enum ইম্পোর্ট করুন

// JWT payload interface
interface JwtPayloadCustom {
  id: string;
  role: Role; // ✅ এখানে নির্দিষ্ট করার বদলে সরাসরি Prisma Role ব্যবহার করুন
}

// Extend Request type to include user
export interface RequestWithUser extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role; // ✅ এখানেও Role টাইপ আপডেট করা হয়েছে
    isBanned: boolean;
  };
}

export const protect =
  (roles: Role[] = []) => // ✅ (Role[]) ব্যবহার করায় এখন SUPER_ADMIN সহ সব রোল সাপোর্ট করবে
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const token = authHeader.split(" ")[1];

      // Decode token safely
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET!
      ) as JwtPayloadCustom;

      // Find user in DB
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      if (!user || user.isBanned) {
        return res.status(401).json({ error: "Unauthorized or account banned" });
      }

      // Role check
      // ✅ এখন user.role (যা SUPER_ADMIN হতে পারে) roles array এর সাথে ম্যাচ করবে
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: "Access denied: Role not allowed" });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ TypeScript এখন আর এখানে এরর দেবে না
        isBanned: user.isBanned,
      };

      next();
    } catch (err) {
      return res.status(401).json({ error: "Token invalid or expired" });
    }
  };