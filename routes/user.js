const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config()
const moment = require('moment');
const router = express.Router();
const paypal = require('@paypal/payouts-sdk');
router.use(express.static("public"));
router.use(express.static("assets"));


function generateID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


router.get('/verify', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'user/verify/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        if (response.message) {
            res.redirect('/login?verified=1')
        }
    } catch (e) {
        console.error(e)
    }
})
router.get('/fundraisers', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'fundraising/user/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const fundraisings = await response.json();
        res.render("fundraiser-dashboard", { data: fundraisings.body });
    }
    catch (e) {
        res.render("fundraiser-dashboard", { data: undefined })
        console.log(e);
    }

});
// page settings
router.get('/fundraisers/settings', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'fundraising/user/settings/' + req.query.id,            //<-Change to DB
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const settings = await response.json();
        if (!settings.body.validation[0]) {
            res.redirect(`/user/fundraisers/add/validation?id=${req.query.id}`)
        }
        else if (settings.body.funding[0]) {
            res.render("fundraiser-settings", {
                fundraising: settings.body.fundraising[0],
                funding: settings.body.funding[0],
                success: req.query.success
            });

        }
        else {
            res.redirect(`/user/fundraisers/add/method?id=${req.query.id}`)
        }

    }
    catch (e) {
        res.render("error-page", { data: undefined })
        console.log(e);
    }
});

// withdraw
router.get('/fundraisers/settings/withdraw', async (req, res) => {
    try {
        const fund = req.query.fund;
        const getFunding = await fetch(process.env.DB + 'fundraising/get/funding/' + fund,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const response = await getFunding.json();
        // console.log(response.body)
        console.log("Get Success")
        res.render('fundraiser-withdraw', { data: response.body })
    } catch (e) {
        res.render("error-page", { data: undefined })
        console.log(e);
    }
});
router.get('/fundraisers/settings/withdraw/confirm', async (req, res) => {
    try {
        let sender_batch_id = generateID();
        const clientId = "AYoKFz4ffJD3MNmpPOEW9u02b_2MD7YgGRacO6AfwaO1BPjYhXqoLzUbVqYgFw7clIPMtbJXChzxeCsv";
        const clientSecret = "EBkmnahDqTgJGfbYGxn6-ljixFabhJM8dBUF2UsjaKGzwa1F20dJHzEb5ZVukW503EwWVydDhDUDA9e3";
        const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
        const client = new paypal.core.PayPalHttpClient(environment);
        const id = req.query.id;
        const fund = req.query.fund;
        const amount = req.query.amount;
        const receiver = req.query.receiver;
        const currency = req.query.currency;
        let requestBody = {
            "sender_batch_header": {
                "recipient_type": "EMAIL",
                "email_message": "Pay It Forward Withdrawal Success",
                "note": "Pay It Forward Withdrawal Success",
                "sender_batch_id": sender_batch_id,
                "email_subject": "This is a test transaction from SDK"
            },
            "items": [{
                "note": `You have successfully withdrawn $${amount}`,
                "amount": {
                    "currency": currency,
                    "value": amount
                },
                "receiver": receiver,
                "sender_item_id": sender_batch_id
            }]
        }

        console.log(requestBody.items[0].receiver);
        const request = new paypal.payouts.PayoutsPostRequest();
        request.requestBody(requestBody);
        const createPayouts = async function () {
            let response = await client.execute(request);
            console.log(`Response: ${JSON.stringify(response.statusCode)}`);

        }
        createPayouts();
        const updateFunding = await fetch(process.env.DB + 'fundraising/user/withdraw/' + fund,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            })
        res.redirect(`/user/fundraisers/settings?id=${id}&success=1`)
    } catch (e) {
        throw e;
    }

});

router.get('/fundraisers/add', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'reference/',            //<-Change to DB
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const reference = await response.json();

        res.render("fundraiser-add", { data: reference.body });
    }
    catch (e) {
        res.render("error-page", { data: undefined });
        console.log(e);
    }

});
router.get('/fundraisers/add/method', async (req, res) => {
    res.render("fundraiser-add-method");
});
router.get('/fundraisers/updates', async (req, res) => {
    try {
        const id = req.query.id;
        const response = await fetch(process.env.DB + 'update/' + id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            });
        const update = await response.json();
        res.render("fundraiser-settings-update", { data: update.body, moment: moment });
    } catch (e) {
        console.log(e.message);
        res.render("fundraiser-settings-update", { data: undefined });
    }
});

// add validation files
router.get('/fundraisers/add/validation', async (req, res) => {
    try {
        const fundraiser = req.query.id;
        res.render('fundraiser-add-valid', {
            fundraiser: fundraiser
        });
    } catch (e) {
        res.send(e)
    }

})


// forward dashboard

router.get('/forwards', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'forward/dashboard/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const forward = await response.json();
        res.render("forward-dashboard", { data: forward.body });
    }
    catch (e) {
        res.render("forward-dashboard", { data: undefined })
        console.log(e);
    }
})
// forward add 
router.get('/forwards/add', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'reference/',            //<-Change to DB
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const reference = await response.json();

        res.render("forward-add", { data: reference.body });
    }
    catch (e) {
        res.render("error-page", { data: undefined });
        console.log(e);
    }
})
// forward add validation
router.get('/forwards/add/validation', async (req, res) => {
    try {
        const forward = req.query.id;
        res.render('forward-add-valid', {
            forward: forward
        });
    } catch (e) {
        res.send(e)
    }
})

router.get('/forwards/add/method', async (req, res) => {
    try {
        const forward = req.query.id;
        res.render('forward-add-method', {
            forward: forward
        });
    } catch (e) {
        res.send(e)
    }
})

// get updates
router.get('/forwards/updates',async(req,res)=>{
    try {
        const response = await fetch(process.env.DB + 'forward/update/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const update = await response.json();
        res.render('forward-settings-update',{
            data:update.body,
            moment:moment
        })
    } catch (e) {
        
    }
})

// forward settings
router.get('/forwards/settings', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'forward/dashboard/page/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const getGoods = await fetch(process.env.DB + 'forward/dashboard/page/goods/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const getValidation = await fetch(process.env.DB + 'forward/dashboard/page/validation/' + req.query.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const forward = await response.json();
        const valid = await getValidation.json();
        const goods = await getGoods.json();
        console.log(valid.body[0])
        if (!valid.body[0]) {
            res.redirect(`/user/forwards/add/validation?id=${req.query.id}`)
        }
        else if (goods.body[0]) {
            res.render("forward-settings", {    
                data: forward.body.dashboard,
                goods: goods.body,
                user: forward.body.user,
                success: req.query.success
            });
        }
        else {
            res.redirect(`/user/forwards/add/method?id=${req.query.id}`)
        }

    }
    catch (e) {
        res.send("404 ")
        console.log(e);
    }
})
module.exports = router;