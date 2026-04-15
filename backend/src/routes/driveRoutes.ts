import { Router } from "express";
import { z } from "zod";

import {
  checkDriveConnection,
  copyItem,
  createFolder,
  deleteItem,
  listFolders,
  listItems,
  moveItem,
  renameItem,
} from "../services/googleDriveService.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

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

router.post("/folders", async (req, res, next) => {
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

router.patch("/items/:itemId/rename", async (req, res, next) => {
  try {
    const bodyParsed = renameItemSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      throw new HttpError(400, bodyParsed.error.message);
    }

    const data = await renameItem({
      itemId: req.params.itemId,
      name: bodyParsed.data.name,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.patch("/items/:itemId/move", async (req, res, next) => {
  try {
    const bodyParsed = moveItemSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      throw new HttpError(400, bodyParsed.error.message);
    }

    const data = await moveItem({
      itemId: req.params.itemId,
      targetParentId: bodyParsed.data.targetParentId,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/items/copy", async (req, res, next) => {
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

router.delete("/items/:itemId", async (req, res, next) => {
  try {
    await deleteItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as driveRouter };
