import { Router } from "express";
import { z } from "zod";
import multer from "multer";

import {
  checkDriveConnection,
  copyItem,
  createFolder,
  deleteItem,
  getThumbnail,
  listFolders,
  listItems,
  moveItem,
  renameItem,
  uploadFile,
} from "../services/googleDriveService.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

const listItemsQuerySchema = z.object({
  folderId: z.string().min(1).optional(),
  pageSize: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined)),
  pageToken: z.string().optional(),
  search: z.string().optional(),
});

const listFoldersQuerySchema = z.object({
  parentId: z.string().min(1).optional(),
});

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().min(1).optional(),
});

const renameItemSchema = z.object({
  name: z.string().min(1),
});

const moveItemSchema = z.object({
  targetParentId: z.string().min(1),
});

const copyItemSchema = z.object({
  itemId: z.string().min(1),
  targetParentId: z.string().min(1),
  name: z.string().min(1).optional(),
});

function getItemIdParam(param: string | string[] | undefined): string {
  if (!param || Array.isArray(param)) {
    throw new HttpError(400, "itemId path parameter is required");
  }

  return param;
}

function getRequiredRootFolderId(): string {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!rootFolderId) {
    throw new HttpError(
      500,
      "GOOGLE_DRIVE_ROOT_FOLDER_ID is required when parentId/folderId is not provided.",
    );
  }

  return rootFolderId;
}

router.get("/status", async (_req, res, next) => {
  try {
    const result = await checkDriveConnection();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/folders", async (req, res, next) => {
  try {
    const parsed = listFoldersQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.message);
    }

    const parentId = parsed.data.parentId ?? getRequiredRootFolderId();
    const data = await listFolders(parentId);
    res.json({ items: data });
  } catch (error) {
    next(error);
  }
});

router.get("/items", async (req, res, next) => {
  try {
    const parsed = listItemsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.message);
    }

    const pageSize = parsed.data.pageSize;

    if (pageSize && (Number.isNaN(pageSize) || pageSize <= 0 || pageSize > 1000)) {
      throw new HttpError(400, "pageSize must be between 1 and 1000");
    }

    const folderId = parsed.data.folderId ?? getRequiredRootFolderId();

    const data = await listItems({
      folderId,
      pageSize,
      pageToken: parsed.data.pageToken,
      search: parsed.data.search,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/folders", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const parsed = createFolderSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.message);
    }

    const data = await createFolder({
      name: parsed.data.name,
      parentId: parsed.data.parentId ?? getRequiredRootFolderId(),
    });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.patch("/items/:itemId/rename", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const itemId = getItemIdParam(req.params.itemId);
    const bodyParsed = renameItemSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      throw new HttpError(400, bodyParsed.error.message);
    }

    const data = await renameItem({
      itemId,
      name: bodyParsed.data.name,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.patch("/items/:itemId/move", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const itemId = getItemIdParam(req.params.itemId);
    const bodyParsed = moveItemSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      throw new HttpError(400, bodyParsed.error.message);
    }

    const data = await moveItem({
      itemId,
      targetParentId: bodyParsed.data.targetParentId,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/items/copy", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const parsed = copyItemSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.message);
    }

    const data = await copyItem(parsed.data);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:itemId", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const itemId = getItemIdParam(req.params.itemId);
    await deleteItem(itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/thumbnail/:fileId", async (req, res, next) => {
  try {
    const fileId = getItemIdParam(req.params.fileId);
    const size = req.query.size ? Number(req.query.size) : 220;

    if (Number.isNaN(size) || size < 32 || size > 1600) {
      throw new HttpError(400, "size must be between 32 and 1600");
    }

    const { buffer, mimeType } = await getThumbnail(fileId, size);

    res.set({
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    });
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post("/upload", requireAuth, requireRole(["admin"]), upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new HttpError(400, "No file provided");
    }

    const parentId = typeof req.body.parentId === "string" && req.body.parentId
      ? req.body.parentId
      : getRequiredRootFolderId();

    const name = typeof req.body.name === "string" && req.body.name
      ? req.body.name
      : file.originalname;

    const data = await uploadFile({
      buffer: file.buffer,
      mimeType: file.mimetype,
      name,
      parentId,
    });

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

export { router as driveRouter };
