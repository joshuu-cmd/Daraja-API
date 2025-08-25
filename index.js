require('dotenv').config();
const express = require('express');
const axios = require('axios');
const getAccessToken = require('./access_token');

const app = express();
app.use(express.json());


app.post('/stkpush', async (req, res) => {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(process.env.SHORTCODE + process.env.PASSKEY + timestamp).toString('base64');

    try {
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: process.env.SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: '1',
                PartyA: process.env.PHONE,
                PartyB: process.env.SHORTCODE,
                PhoneNumber: process.env.PHONE,
                CallBackURL: process.env.CALLBACK_URL,
                AccountReference: 'TestAccount',
                TransactionDesc: 'Test Payment',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        res.json(response.data);
    } catch (err) {
        res.status(500).json(err.response?.data || { error: err.message });
    }
});


app.post('/callback', (req, res) => {
    console.log('Callback received:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
