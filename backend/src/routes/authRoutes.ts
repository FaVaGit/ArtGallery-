import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/authMiddleware.js";
import { login } from "../services/authService.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/login", (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.message);
    }

    const result = login(parsed.data.username, parsed.data.password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

export { router as authRouter };
