const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const moment = require('moment');
require('dotenv').config();
router.use(express.static("public"));
router.use(express.static("assets"));


router.get('/', async (req, res) => {

    try {
        const response = await fetch(process.env.DB + 'fundraising/',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const fundraisers = await response.json();
        res.render('fundraiser', { data: fundraisers.body });
    }
    catch (e) {
        res.render("fundraiser", { data: undefined });
        console.log(e);
    }


});
// search
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        const search = await fetch(process.env.DB + 'fundraising/search/' + query, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
        const searchResult = await search.json();
        res.render('fundraiser-search', { data: searchResult.body, query: query })
    } catch (e) {
        res.render('fundraiser-search', { data: e })
        console.log(e)
    }
})

// fundraising page
router.get('/page', async (req, res) => {
        try {
            const page = await fetch(process.env.DB + 'fundraising/page/' + req.query.id, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
            const history = await fetch(process.env.DB + 'fundraising/history/' + req.query.id, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        
        const pageResult = await page.json();
        const historyResult = await history.json();
        const fundraiser = pageResult.body.fundraiser[0];
        const funding = pageResult.body.funding[0]
        const update = pageResult.body.update[0]
        const user = pageResult.body.user[0]
        const comments = pageResult.body.comment
        const success = req.query.success;
        console.log(funding)

        res.render('fundraiser-page', {
            user:user,
            fundraiser:fundraiser,
            funding:funding,
            history: historyResult.body,
            update:update,         
            comments:comments,     
            moment: moment,
            success: success
        })
    }
    catch (e) {
        res.render("fundraiser-page", { data: undefined, success: 0 });
        console.log(e);
    }
});
router.get('/page/updates', async (req, res) => {
    try {
        const response = await fetch(process.env.DB + 'update/' + req.query.id,            //<-Change to DB
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const updates = await response.json();
        res.render('fundraiser-page-updates', { data: updates.body, moment: moment });
    }
    catch (e) {
        res.render("fundraiser-page-updates", { data: undefined });
        console.log(e);
    }
});
router.get('/page/donate', async (req, res) => {
    try{
        const fund = req.query.fund;
        const name = req.query.name;

        const getFunding = await fetch(process.env.DB + 'fundraising/get/funding/' + fund, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        const funding = await getFunding.json();
        const getQR = await fetch(process.env.DB + 'fundraising/get/qr/' + fund, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        console.log(funding)
        const qr = await getQR.json();
        const gcash = qr.body.gcash[0]
        const paymaya= qr.body.paymaya[0]
        res.render('fundraiser-donate', {
            id: fund,
            name: name,
            gcash:gcash,
            funding:funding.body,
            paymaya:paymaya,
        });
        
    }
    catch(e){
        res.send
    }

   
    
});
router.get('/page/donate/goods', async (req, res) => {
    try{
        const id = req.query.id;
        const getGoods = await fetch(process.env.DB + 'goods/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        const goods = await getGoods.json();
        res.render('fundraiser-goods', {
            goods: goods.body.goods[0],
            user: goods.body.user[0],
            fundraiser: goods.body.fundraiser[0]
        });
        
    }
    catch(e){
        res.send(e)
    }
});


module.exports = router;