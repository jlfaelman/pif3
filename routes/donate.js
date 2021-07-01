
const express = require('express');
const router = express.Router();
require('dotenv').config()
router.use(express.static("public"));
router.use(express.static("assets"));
const fetch = require('node-fetch');
const Xendit = require('xendit-node');
const paypal = require('paypal-rest-sdk');
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AYoKFz4ffJD3MNmpPOEW9u02b_2MD7YgGRacO6AfwaO1BPjYhXqoLzUbVqYgFw7clIPMtbJXChzxeCsv',
    'client_secret': 'EBkmnahDqTgJGfbYGxn6-ljixFabhJM8dBUF2UsjaKGzwa1F20dJHzEb5ZVukW503EwWVydDhDUDA9e3'
});




async function updateFunding(id, amount) {
    try {
        const getFunding = await fetch(`${process.env.DATABASE_URL}/fundraising/get/funding/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        const response = await getFunding.json();
        const funding = response.body;
        const quota = parseInt(funding.Funding_Quota, 10);
        const total = parseInt(funding.Funding_Total, 10)
        const received = parseInt(funding.Funding_Received, 10);
        if (total == quota) {
            const newTotal = total + parseInt(amount, 10);
            const newReceived = received + parseInt(amount, 10);

            const updateBody = {
                received: newReceived,
                total: newTotal
            }
            const update = await fetch(`${process.env.DATABASE_URL}/fundraising/update/funding/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(updateBody)
            })
            return
        } else {
            const newTotal = total + parseInt(amount, 10);
            const newReceived = received + parseInt(amount, 10);
            const updateBody = {
                received: newReceived,
                total: newTotal
            }
            const update = await fetch(`${process.env.DATABASE_URL}/fundraising/update/funding/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(updateBody)
            })
            return
        }
    } catch (e) {
        return e;
    }
}
async function addDonate(fundID, fundraiserID, uID, type, amount, anon) {
    try {
        const donate = {
            fund: fundID,
            fundraiser: fundraiserID,
            user: uID,
            type: type,
            amount: amount,
            anonymous: anon
        }
        const addDonate = await fetch(`${process.env.DATABASE_URL}/donation/donate`,            //<-Change to DB
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(donate)
            });
        const response = await addDonate.json();
        return response.body[0];
    } catch (e) {
        return e
    }
}


router.get('/verify', async (req, res) => {

    const title = req.query.title;
    const amount = req.query.amount;
    const currency = req.query.currency;
    const userID = req.query.user;
    const fundingID = req.query.funding;
    const platform = req.query.platform;
    const fundraiserID = req.query.fundraiser;
    const anon = req.query.anonymous;

    if (platform == 'paypal') {
        const successURL = `${process.env.URL}donate/paypal/success?amount=${amount}&currency=${currency}&user=${userID}&fund=${fundingID}&fundraiser=${fundraiserID}&type=${platform}&anon=${anon}`;
        const create_payment_json = {
            "intent": "sale",
            "experience_profile_id": "XP-4DFM-D9DF-RB7D-QLHV",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": successURL,
                "cancel_url": `${process.env.URL}/donate/cancel`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": title,
                        "sku": title,
                        "price": amount,
                        "currency": currency,
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": currency,
                    "total": amount
                },
                "description": "Donation from Pay It Forward"
            }]
        };

        paypal.payment.create(create_payment_json, async function (e, payment) {
            if (e) {
                console.log(e.response);
                throw e;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === "approval_url") {
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });

    }
    else if (platform == 'paymaya') {
        // try {
        //     const config = new Config();
        //     // Set your X-API-KEY with the API key from the Customer Area.
        //     config.apiKey = process.env.ADYEN_KEY;
        //     config.merchantAccount = 'PayItForward366POS';
        //     const client = new Client({ config });
        //     client.setEnvironment("TEST");
        //     const checkout = new CheckoutAPI(client);
        //     checkout.payments({
        //         amount: { currency: "PHP", value: 1000 },
        //         paymentMethod: {
        //             type: 'gcash'
        //         },
        //         reference: "YOUR_ORDER_NUMBER",
        //         merchantAccount: config.merchantAccount,
        //         returnUrl: "https://your-company.com/checkout?shopperOrder=12xy.."
        //     }).then(res => res)
        //     .catch(err => console.log(err));
        // } catch (e) {
        //     throw e;
        // }
    }
    else if (platform == 'gcash') {

    }

});


// router.get('/profile',(req,res)=>{
//     let profile_name = Math.random().toString(36).substring(7);

//     const create_web_profile_json = {
//     "name": profile_name,
//     "presentation": {
//         "brand_name": "Best Brand",
//         "logo_image": "https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg",
//         "locale_code": "US"
//     },
//     "input_fields": {
//         "allow_note": true,
//         "no_shipping": 1,
//         "address_override": 1
//     },
//     "flow_config": {
//         "landing_page_type": "billing",
//         "bank_txn_pending_url": "http://www.yeowza.com"
//     }
//     };
//     paypal.webProfile.create(create_web_profile_json,function (error, webProfiles) {
//         if (error) {
//             throw error;
//         } else {
//             console.log("List Web Profiles Response");
//             console.log(JSON.stringify(webProfiles));
//         }
//     });
// });

// paypal success
router.get('/paypal/success', async (req, res) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const amount = req.query.amount;
        const currency = req.query.currency;
        const user = req.query.user;
        const type = req.query.type;
        const fund = req.query.fund;
        const fundraiser = req.query.fundraiser;
        const anon = req.query.anon;
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                amount: {
                    "currency": currency,
                    "total": amount
                }
            }],
        }
        paypal.payment.execute(paymentId, execute_payment_json, async (e, payment) => {
            if (e) {
                res.render('error-page', { data: e });
            } else {
                try {
                    const f = await updateFunding(fund, amount);
                    const d = await addDonate(fund, fundraiser, user, type, amount, anon);
                    res.redirect(`/donate/comment?id=${d.Donation_ID}&fundraiser=${fundraiser}`)
                } catch (e) {
                    res.render('error-page', { data: e });
                }
            }
        });
    } catch (e) {
        res.render('error-page', { data: e });
    }

});

router.get('/comment', async (req, res) => {
    try {
        const donation = req.query.id;
        const getDonation = await fetch(`${process.env.DATABASE_URL}/donation/${donation}`,            //<-Change to DB
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            });
        const response = await getDonation.json();
        res.render('fundraiser-comment', { data: response.body });
    } catch (e) {
        res.render('fundraiser-comment', { data: undefined });
    }

});


router.get('/cancel', (req, res) => {
    res.send("Donation Cancelled");
    res.redirect('cancel');
})
module.exports = router;