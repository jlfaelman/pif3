const express = require('express');
const router = express.Router();
router.use(express.static("public"));
router.use(express.static("assets"));
const paypal = require('@paypal/payouts-sdk');
// const paypal = require('paypal-rest-sdk');
// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': 'AYoKFz4ffJD3MNmpPOEW9u02b_2MD7YgGRacO6AfwaO1BPjYhXqoLzUbVqYgFw7clIPMtbJXChzxeCsv',
//     'client_secret': 'EBkmnahDqTgJGfbYGxn6-ljixFabhJM8dBUF2UsjaKGzwa1F20dJHzEb5ZVukW503EwWVydDhDUDA9e3'
//   });
function generateID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// confirm withdrawal
router.get('/confirm', (req, res) => {
    
    let sender_batch_id =  generateID();

    const clientId = "AYoKFz4ffJD3MNmpPOEW9u02b_2MD7YgGRacO6AfwaO1BPjYhXqoLzUbVqYgFw7clIPMtbJXChzxeCsv";
    const clientSecret = "EBkmnahDqTgJGfbYGxn6-ljixFabhJM8dBUF2UsjaKGzwa1F20dJHzEb5ZVukW503EwWVydDhDUDA9e3";
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);
    const amount = req.query.amount;
    const receiver = req.query.receiver;
    const currency = req.query.currency;
    let requestBody = {
        "sender_batch_header": {
            "recipient_type": "EMAIL",
            "email_message": "SDK payouts test txn",
            "note": "Enjoy your Payout!!",
            "sender_batch_id": sender_batch_id,
            "email_subject": "This is a test transaction from SDK"
        },
        "items": [{
            "note": `You have successfully withdrawn $${amount}`,
            "amount": {
                "currency": currency,
                "value": amount
            },
            "receiver": "pif-withdraw@personal.example.com",
            "sender_item_id": "Test_txn_1"
        }]
    }

 
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);

    
    const createPayouts = async function () {
        let response = await client.execute(request);
        console.log(`Response: ${JSON.stringify(response)}`);
        console.log(`Payouts Create Response: ${JSON.stringify(response.result)}`);
    }
    createPayouts().then(
        res.render('withdraw-success')
    );
});




// router.get('/',);
module.exports = router;