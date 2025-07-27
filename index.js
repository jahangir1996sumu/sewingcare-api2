const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const API_SECRET = process.env.API_SECRET || "sewingcare-secure-token";

const BASE_IDS = {
    juki: {
        bangla: "appkY8QFeEL7KyDft",
        english: "appNe00dE4xgwEYWU"
    },
    brother: {
        bangla: "app6xNEn1dsDSap66",
        english: "appqaVn3WoCI4wmZm"
    }
};

const TABLE_NAME = "ErrorCodes";

// ✅ Middleware for secure API
app.use("/api/error", (req, res, next) => {
    const clientToken = req.headers["x-api-key"];
    if (!clientToken || clientToken !== API_SECRET) {
        return res.status(401).json({ error: "Unauthorized request" });
    }
    next();
});

// ✅ Main Secure API
app.get("/api/error", async (req, res) => {
    const { brand, lang, code } = req.query;

    if (!brand || !lang || !code) {
        return res.status(400).json({ error: "brand, lang এবং code প্রদান করুন" });
    }

    const brandData = BASE_IDS[brand.toLowerCase()];
    if (!brandData || !brandData[lang.toLowerCase()]) {
        return res.status(400).json({ error: "Invalid brand or language" });
    }

    const baseId = brandData[lang.toLowerCase()];
    const url = `https://api.airtable.com/v0/${baseId}/${TABLE_NAME}?filterByFormula={error}="${code}"`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        if (response.data.records.length === 0) {
            return res.status(404).json({ error: "Error code not found" });
        }

        const record = response.data.records[0].fields;

        res.json({
            code: record.error || "",
            model: record.model || "",
            cause: record.Cause || "",
            instructions: record.Instructions || ""
        });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
});

// ✅ Public Test Endpoint
app.get("/test", async (req, res) => {
    const brand = "juki";
    const lang = "bangla";
    const code = "01";

    const baseId = BASE_IDS[brand][lang];
    const url = `https://api.airtable.com/v0/${baseId}/${TABLE_NAME}?filterByFormula={error}="${code}"`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        if (response.data.records.length === 0) {
            return res.json({ message: "Sample error code not found" });
        }

        const record = response.data.records[0].fields;

        res.json({
            code: record.error || "",
            model: record.model || "",
            cause: record.Cause || "",
            instructions: record.Instructions || ""
        });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
