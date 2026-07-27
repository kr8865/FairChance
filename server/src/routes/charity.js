import { Router } from "express";
import { Charity } from "../models/Charity.js";

export const charityRouter = Router();

charityRouter.get("/", async (req, res) => {
  try {
    const charities = await Charity.find({
      isActive: true,
    }).sort({
      isFeatured: -1,
      name: 1,
    });

    res.json(charities);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch charities",
    });
  }
});
