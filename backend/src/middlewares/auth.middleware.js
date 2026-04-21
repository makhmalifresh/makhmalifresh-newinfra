import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-default-super-secret-key';

export const verifyUserJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const claims = await clerkClient.verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    if (!claims.sub) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token claims' });
    }
    req.auth = { userId: claims.sub };
    next();
  } catch (error) {
    console.error('Clerk Token Verification Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const verifyAdminJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No admin token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Not an admin token' });
    }
    req.admin = { id: decoded.adminId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
  }
};
