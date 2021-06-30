const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const moment = require('moment');
require('dotenv').config();
router.use(express.static("public"));
router.use(express.static("assets"));

//  get all
router.get('/', async(req,res)=>{
    try {
        const response = await fetch(`${process.env.DATABASE_URL}/forward/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        const forward = await response.json();
        res.render('forward', { data: forward.body });
    }
    catch (e) {
        res.render("forward", { data: undefined });
        console.log(e);
    }
})

// get page
router.get('/page', async(req,res)=>{
    try {
        
        const response = await fetch(`${process.env.DATABASE_URL}/forward/page/${req.query.id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
            })
        
        const getGoods = await fetch(`${process.env.DATABASE_URL}/forward/dashboard/page/goods/${req.query.id}`)
        
        const forward = await response.json();
        const goods = await getGoods.json();
        
        res.render('forward-page', { 
            forward: forward.body.forward[0],
            user: forward.body.user[0],
            goods:goods.body[0],
            success:req.query.success,
            
            moment:moment
         });
    }
    catch (e) {
        res.send(e.message);
        console.log(e.message);
    }
})
router.get('/page/donate',async(req,res)=>{
    try {
        const getGoods = await fetch(`${process.env.DATABASE_URL}/forward/dashboard/page/goods/${req.query.id}`)
        const goods = await getGoods.json();
        console.log(goods)
        res.render('forward-donate', { 
            goods:goods.body[0],
            moment:moment
         });
    } catch (e) {
        res.send(e.message);
        console.log(e.message);
    }
})

// search
router.get('/search',async(req,res)=>{
    try {
        const query = req.query.query;
        const search = await fetch(`${process.env.DATABASE_URL}/forward/search/${ query}` , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
        const searchResult = await search.json();
        res.render('forward-search', { data: searchResult.body, query: query })
    } catch (e) {
        res.render('forward-search', { data: e })
        console.log(e)
    }
})


module.exports = router;