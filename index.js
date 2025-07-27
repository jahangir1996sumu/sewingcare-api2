const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Airtable Token from Render Environment Variables
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

// Airtable Base IDs
const BASES = {
    "juki-bangla": "appkY8QFeEL7KyDft",
    "juki-english": "appNe00dE4xgwEYWU",
    "brother-bangla": "app6xNEn1dsDSap66",
    "brother-english": "appqaVn3WoCI4wmZm"
};

const TABLE_NAME = "ErrorCodes"; // Airtable Table Name (must match)

async function fetchData(baseId) {
    try {
        const response = await axios.get(`https://api.airtable.com/v0/${baseId}/${TABLE_NAME}`, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`
            }
        });
        return response.data.records.map(record => record.fields);
    } catch (error) {
        console.error(error.response?.data || error.message);
        return { error: "Failed to fetch data" };
    }
}

// Dynamic Routes for each base
Object.keys(BASES).forEach(key => {
    app.get(`/${key}`, async (req, res) => {
        const data = await fetchData(BASES[key]);
        res.json(data);
    });
});

app.get('/', (req, res) => {
    res.send('✅ SewingCare API is running!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
