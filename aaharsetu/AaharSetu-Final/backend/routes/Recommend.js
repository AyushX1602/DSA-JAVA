const express = require("express");
const axios = require("axios");
const router = express.Router();

router.use(express.json()); 

router.post("/recommend", async (req, res) => {
    try {
        const { latitude, longitude, foodType, quantity } = req.body;

        if (!latitude || !longitude || !foodType || !quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log("🔹 Sending request to Flask API...");

        const response = await axios.post(
            "http://localhost:5002/recommend",  //flask server
            { latitude, longitude, foodType, quantity },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ Flask Response:", response.data);
        res.json(response.data);

    } catch (error) {
        console.error("Error fetching recommendations:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});


router.post("/predict", async (req, res) => {
    try {
        const flaskResponse = await axios.post("http://localhost:5002/predict", req.body);
        res.json(flaskResponse.data); // Send response to frontend
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


