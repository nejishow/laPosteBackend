const express = require("express")
const router = new express.Router()
const HistoricP = require('../models/historiquePaiements')
const Clients = require('../models/client')
const Boites = require('../models/boite')
const Clientb = require('../models/clientBoite')
const HF = require('../models/historiqueForfait')
const auth = require('../middleware/auth')
const Forfaits = require('../models/forfait')
const ALLH = require('../models/allhistorics')
const BOITETYPES = require('../models/boiteType')
const CB = require('../models/clientBoite')
router.post('/historicP', auth, async (req, res) => {
    try {
        const hp = await new HistoricP(req.body)
        await hp.save()
        const cb  = await CB.findOne({idClient: hp.idClient})
        if (parseInt(cb.startDate) < (new Date().getFullYear())) {
            cb.NA = false;
            cb.save()
        }
        return res.status(201).send(hp)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post('/historicPs', async (req, res) => {
    try {
        const clientboites = await Clientb.find({})
        const forfaits = await Forfaits.find({})
        clientboites.forEach(async cb => {
            const boiteTypes = await BOITETYPES.findById({ _id: cb.idBoiteType })
            const hf = await HF.findOne({ idClient: cb.idClient })
            if (boiteTypes && hf) {
                var nh = await new HistoricP()
                nh.boiteNumber = cb.boiteNumber
                nh.clientName = cb.clientName
                nh.idBoite = cb.idBoite
                nh.idClient = cb.idClient
                nh.date = cb.startDate
                nh.total = boiteTypes.price
                nh.priceBoite = boiteTypes.price
                nh.forfaits = []
                nh.idStaff = "5f2006317c3b1a2d843b36d4"
                await hf.forfaits.forEach(async forfait => {
                    await forfaits.forEach(element => {
                        if (forfait.idForfait === element._id) {
                            nh.total += element.price
                            nh.forfaits.push({
                                idForfait: element._id,
                                price: element.price,
                                name: element.name
                            })
                        }
                    });
                });
                await nh.save()
            } else {
                console.log(cb._id);
            }

        });
        return res.status(201).send()
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post('/historicPupdate', async (req, res) => {
    try {
        const hps = await HistoricP.find({})
        hps.forEach(async hp => {
            hp.enabled = true
            hp.toModify = false
            hp.toDelete = false
            await hp.save()
        });
        return res.status(201).send(hp)
    } catch (error) {
        return res.status(500).send(error)
    }
})
router.get('/allPayment', async (req, res) => { // tous les paiements
    try {
        const historics = await HistoricP.find({ enabled: true })
        if (!historics) {
            return res.status(404).send("Pas de paiements pour ce client")

        }
        return res.status(201).send(historics)
    } catch (error) {
        return res.status(500).send(error)
    }
})
router.get('/historicPs/:id', async (req, res) => { // tous les paiements d'un utilisateur
    try {
        const historics = await HistoricP.find({ idClient: req.params.id, enabled: true })
        if (!historics) {
            return res.status(404).send("Pas de paiements pour ce client")

        }
        return res.status(201).send(historics)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get('/payment/:id', async (req, res) => { // info sur un paiement precis
    try {
        const historic = await HistoricP.findById({ _id: req.params.id })
        if (!historic) {
            return res.status(404).send("Pas de paiement")
        }
        return res.status(201).send(historic)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post('/removePayment/:id', auth, async (req, res) => { //
    try {
        const historic = await HistoricP.findById({ _id: req.params.id })
        if (!historic) {
            return res.status(404).send("Pas de paiement")
        }
        historic.idStaff = req.staff._id
        historic.toDelete = true
        historic.toModify = true
        historic.enabled = false

        await historic.save()
        return res.status(201).send(historic)
    } catch (error) {
        return res.status(500).send(error)
    }
})


router.post('/changePayment', async (req, res) => {
    try {
        const hps = await HistoricP.find({})
        await hps.forEach(async hp => {
            hp.enabled = true
            hp.toModify = false;
            hp.toDelete = false
            await hp.save()
        });
        await hps.forEach(async hp => {
            if (hp.boiteNumber === '' || hp.boiteNumber === null || hp.boiteNumber === undefined) {
                hp.enabled = false
            }
            await hp.save()
        });
        return res.status(201).send(hps)
    } catch (error) {
        return res.status(500).send(error)
    }
})








module.exports = router