const express = require("express");
const Router = express.Router();
const middle = require('../middleware/middle');
const Platformmodule = require("../module/platform");
const { default: slugify } = require("slugify");
 const formidable = require("express-formidable");
const fs = require("fs");
const order = require("../module/order");

// Fetch all platforms
Router.get('/fetchallPlatform',middle, async (req, res) => {
    try {
        const Platform = await Platformmodule.find({});
        res.json(Platform);
    } catch (error) {
        console.error('Error fetching all platforms:', error);
        res.status(500).send("Internal error");
    }
});

// Fetch all platform details with aggregated sales data
Router.get('/fetchallPlatformdetail', middle, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Convert startDate and endDate to Date objects if provided
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Default date filter for the entire date range
        const matchFilter = dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {};

        const totalSalesByPlatform = await order.aggregate([
            {
                $match: matchFilter // Match orders based on the createdAt date range
            },
            {
                $lookup: {
                    from: "platforms", // The collection to join
                    localField: "Platform", // Field from the `order` collection
                    foreignField: "_id", // Field from the `platforms` collection
                    as: "platformInfo" // Alias for the joined data
                }
            },
            {
                $unwind: "$platformInfo" // Deconstructs the array field from the previous lookup
            },
            {
                $group: {
                    _id: "$platformInfo.name",
                    totalSales: { $sum: "$Salesamount" },
                    totalSalesQ: { $sum: 1 },
                    totalRTO: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "RTO"] }, "$Salesamount", 0]
                        }
                    },
                    totalRTOQ: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "RTO"] }, 1, 0]
                        }
                    },
                    totalDTO: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "DTO"] }, "$Salesamount", 0]
                        }
                    },
                    totalDTOQ: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "DTO"] }, 1, 0]
                        }
                    },
                    totalrefund: {
                        $sum: {
                            $cond: [{ $eq: ["$refundCondition", "YES"] }, "$Salesamount", 0]
                        }
                    },
                    totalrefundQ: {
                        $sum: {
                            $cond: [{ $eq: ["$refundCondition", "YES"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json(totalSalesByPlatform);
    } catch (error) {
        console.error('Error fetching platform details:', error);
        res.status(500).send('Server error');
    }
});










Router.get('/fetchallPlatformCostDetail', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Convert startDate and endDate to Date objects if provided
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Default date filter for the entire date range
        const matchFilter = dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {};

        const totalCostByPlatform = await order.aggregate([
            {
                $match: matchFilter // Match orders based on the createdAt date range
            },
            {
                $lookup: {
                    from: "platforms", // The collection to join
                    localField: "Platform", // Field from the `order` collection
                    foreignField: "_id", // Field from the `platforms` collection
                    as: "platformInfo" // Alias for the joined data
                }
            },
            {
                $unwind: "$platformInfo" // Deconstructs the array field from the previous lookup
            },
            {
                $group: {
                    _id: "$platformInfo.name",
                    totallostCost: {
                        $sum: {
                            $cond: [
                                { $or: [{ $eq: ["$status", "Lost"] }, { $eq: ["$Condition", "partial"] }, { $eq: ["$Condition", "Fraud"] }] },
                                "$totalCost",
                                0
                            ]
                        }
                    },
                    claimamount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Claim"] }, "$claimamount", 0]
                        }
                    },
                    totalClaimRequiredQ: {
                        $sum: {
                            $cond: [{ $eq: ["$claimrequired", "YES"] }, 1, 0]
                        }
                    },
                    totalClaimAppliedQ: {
                        $sum: {
                            $cond: [{ $eq: ["$claimapplied", "YES"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json(totalCostByPlatform);
    } catch (error) {
        console.error('Error fetching platform cost details:', error);
        res.status(500).send('Server error');
    }
});












// Fetch single platform by name
Router.get('/fetchplatform/:name',middle, async (req, res) => {
    const name = req.params.name.toLowerCase(); // Ensure case-insensitivity
    try {
        const platform = await Platformmodule.findOne({ name: name });

        if (!platform) {
            return res.status(404).json({ message: 'Platform not found' });
        }

        res.json(platform);
    } catch (error) {
        console.error('Error fetching platform:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update platform by ID
Router.put('/updateplatform/:id',middle, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ error: 'Name is required' });
        }

        const updatedPlatform = await Platformmodule.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );

        if (!updatedPlatform) {
            return res.status(404).send({ error: 'Platform not found' });
        }

        res.status(200).send({
            message: 'Platform updated successfully',
            platform: updatedPlatform,
        });
    } catch (error) {
        console.error('Error updating platform:', error);
        res.status(500).send({ error: 'An error occurred while updating the platform' });
    }
});

// Delete platform by ID
Router.delete("/deleteplatform/:id", async (req, res) => {
    try {
        let category = await Platformmodule.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Platform not found");
        }

        let checkOrder = await order.findOne({ Platform: req.params.id });
        if (checkOrder) {
            return res.status(400).send("Cannot delete platform with existing orders");
        }

        category = await Platformmodule.findByIdAndDelete(req.params.id);
        res.json({ success: "Platform has been deleted", category });
    } catch (error) {
        console.error('Error deleting platform:', error);
        res.status(500).send("Internal error");
    }
});

// Add new platform
Router.post("/addPlatform", middle, async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).send({ error: "Name is required" });
        }

        const existingPlatform = await Platformmodule.findOne({ name });
        if (existingPlatform) {
            return res.status(200).send({
                success: false,
                message: "Platform already exists",
            });
        }

        const newPlatform = new Platformmodule({ name });
        const savedPlatform = await newPlatform.save();
        res.status(200).send({
            success: true,
            message: "Platform Successfully created",
        });    } catch (error) {
        console.error('Error adding platform:', error);
        res.status(500).send("Internal error");
    }
});

module.exports = Router;
