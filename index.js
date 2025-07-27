require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Airtable Token & API Secret
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const API_SECRET = process.env.API_SECRET || "sewingcare-secure-token";

// ✅ Base IDs for Brands & Languages
const BASE_IDS = {
    juki: {
        bangla: "appkY8QFeEL7KyDft",
        english: "appNe00dE4xgwEYWU"
    },
    brother: {
        bangla: "app6xNEn1dsDSap66",
        english: "appqaVn3WoCI4wmZm"
    }
    // ✅ Future brands can be added here
};

// ✅ Airtable Table Name
const TABLE_NAME = "ErrorCodes";

// ✅ Security Middleware
app.use((req, res, next) => {
    const clientToken = req.headers["x-api-key"];
    if (!clientToken || clientToken !== API_SECRET) {
        return res.status(401).json({ error: "Unauthorized request" });
    }
    next();
});

// ✅ API Endpoint
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
    const url = `https://api.airtable.com/v0/${baseId}/${TABLE_NAME}?filterByFormula={Code}="${code}"`;

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
            code: record.Code || "",
            cause: record.Cause || "",
            instructions: record.Instructions || ""
        });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
