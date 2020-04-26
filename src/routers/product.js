const express = require("express")
const router = new express.Router()
const Product = require("../models/product")
const Favoris = require('../models/favoris')
const Rating = require('../models/rating')
const auth = require('../middleware/auth')

router.post('/productAdmin', auth, async (req, res) => { //creer un nouveau produit
    const product = new Product(req.body.params)
    try {
        await product.save()
        return res.status(200).send(product)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/products/:idProductType', async (req, res) => { //retrouver un produit grace au productType
    try {
        const products = await Product.find({ idProductType: req.params.idProductType })
        if (!products) {
            return res.send(400).send({ 'error': 'Pas de produits' })
        }
        res.status(201).send(products)
    } catch (error) {
        res.status(500).send()
    }
})
router.get('/product/:id', async (req, res) => { // retrouver un produit grace à l'id
    try {
        const product = await Product.findById({ _id: req.params.id })
        if (!product) {
            return res.status(400).send({ 'error': 'Pas de produits' })
        }
        res.status(201).send(product)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/allProductAdmin', async (req, res) => { // retrouver tout les produits
    try {
        const products = await Product.find({})
        if (!products) {
            return res.send(400).send({ 'error': 'Pas de produits' })
        }
        res.status(201).send(products)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/product', auth, async (req, res) => { // modifier un produit
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'price', 'pics', 'colors', 'size', 'description'];
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Modifications invalides' })
    }
    try {
        const product = await Product.findById({ _id: req.body._id })
        updates.forEach((update) => product[update] = req.body[update])
        await product.save()
        return res.send(product)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.delete('/product', auth, async (req, res) => { // supprimer un produit
    try {
        const product = await Product.findById({ _id: req.body._id })
        await product.remove() //delete a product it's like save()
        res.send({ 'message': 'Le produit a bien eté supprimé' })

    } catch (error) {
        res.status(500).send()
    }

})







router.get('/likeProduct/:id', auth, async (req, res) => {  // check if the product was liked by the user
    try {
        const favori = await Favoris.findOne({ idUser: req.user._id, idProduct: req.params.id })
        if (favori) {
            return res.status(200).send(favori)
        }
        else {
            return res.status(200).send()
        }
    } catch (error) {
        res.status(400).send(error)
    }
})
router.get('/allLikeProduct/:id', async (req, res) => {   // how many time the product was liked
    try {
        const favori = await Favoris.find({ idProduct: req.params.id, enabled: true })
        if (!favori) {
            throw new Error ('pas de favori')
        }
            return res.status(200).send(favori)
    } catch (error) {
        return res.status(404).send(error)
    }

})
router.get('/allLikeProduct',auth, async (req, res) => {   // all the product liked by the user
    try {
        const favoris = await Favoris.find({ idUser: req.user._id, enabled: true })
        if (!favoris) {
            throw new Error('pas de favori')
        }
        return res.status(200).send(favoris)
    } catch (error) {
        return res.status(404).send(error)
    }

})
router.post('/likeProduct/:id', auth, async (req, res) => { // like the product

    try {
        const favori = await Favoris.findOne({ idUser: req.user._id, idProduct: req.params.id })
        if (favori) {
            favori.enabled = !favori.enabled
            await favori.save()
            return res.status(201).send(favori)

        } else {
            const newFavori = await Favoris({idUser:req.user._id,idProduct:req.params.id,name:req.body.params.name,src:req.body.params.pics[0].src})
            await newFavori.save()
            return res.status(200).send(newFavori)
        }
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get('/allRatingProduct/:id', async (req, res) => {   // how many time the product was liked
    try {
        const ratings = await Rating.find({ idProduct: req.params.id})
        if (!ratings) {
            return res.status(200).send({
                idProduct: req.params.id,
                rating: 0
            })
        }
        return res.status(200).send(ratings)
    } catch (error) {
        return res.status(404).send(error)
    }

})
router.post('/rateProduct/:id', auth, async (req, res) => { // like the product

    try {
        const rating = await Rating.findOne({ idUser: req.user._id, idProduct: req.params.id })
        if (rating) {
            rating.rating = req.body.params
            await rating.save()
            return res.status(201).send(rating)

        } else {
            const newRating = await Rating({ idUser: req.user._id, idProduct: req.params.id, rating: req.body.params})
            await newRating.save()
            return res.status(200).send(newRating)
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router