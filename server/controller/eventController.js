const eventModel = require('../models/event');
// const mongoose = require('mongoose');
const saltedMd5 = require("salted-md5");
// const path = require('path');
// const app = express();
const multer = require('multer');
// const redis = require('../app');
// const admin = require("firebase-admin");
// const serviceAccount = require("../serviceAccountKey.json");
require('dotenv').config();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: process.env.BUCKET_URL
// });

// app.locals.bucket = admin.storage().bucket();

// Set up multer for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDISHOST,
    port: 11327,
    password: process.env.REDISPASS,
})

const getEvent = async (req, res) => {
    try {

        let events = await redis.get("events")

        if (events) {
            console.log("Get from cache")
            return res.json({
                events: JSON.parse(events)
            })
        }
console.log("from MONGO");

        events = await eventModel.find()
        await redis.setex("events", 60, JSON.stringify(events))

        res.status(200).json({ status: "success", response: events })
    } catch (err) {
        next(err)
    }
}

// const getEvent = async (req, res) => {
//     try {
//         let events = await eventModel.find();
//         res.status(200).json({ status: "success", response: events });
//     } catch (err) {
//         res.status(400).json({ status: "Error", response: err.message });
//     }
// };

const findEventByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const event = await eventModel.find({ category: { $regex: category, $options: "i" } });
        res.status(200).json({ status: "success", response: event });
    } catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
};

const findEventByTitle = async (req, res) => {
    try {
        const { search } = req.params;
        const event = await eventModel.find({ title: search });
        res.status(200).json({ status: "success", response: event });
    } catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
};


const createEvent = async (req, res) => {
    try {
        let {
            title, description, image, category, coordinator, price, participants, date, venue
        } = req.body;

        console.log("Request Body:", req.body);

        let event = new eventModel({
            title, description, image, category, coordinator, price, participants, date, venue
        });

        await event.save();
        res.status(201).json({
            status: "success",
            response: "Event Created Successfully"
        })

    }

    catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
}

const editEvent = async (req, res) => {
    try {

        const { id } = req.query
        let event = await eventModel.findById(id);
        res.status(200).json({
            event
        })
    } catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
};

const eventDetails = async (req, res) => {
    try {

        const { id } = req.query
        let event = await eventModel.findById(id);
        res.status(200).json({
            event
        })
    } catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        console.log(req.query.id);
        let event = await eventModel.findOneAndDelete({ _id: req.query.id });
        res.status(200).json({
            status: "success",
            response: `Event deleted`
        })
    } catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
};

const updateEvent = async (req, res) => {
    try {

        let { title, description, image, category, coordinator, price, participants, date, venue } = req.body;

        let updatedevent = await eventModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                image: req.file.buffer,
                title, description, category, coordinator, price, participants, date, venue
            },
            { new: true }
        );

        res.status(200).json({
            status: "success",
            response: "Event Updated"
        })
    }

    // stream.end(req.file.buffer);
    catch (err) {
        res.status(400).json({ status: "Error", response: err.message });
    }
};

// Middleware to handle file uploads in createevent
// app.post('/create-event', upload.single('file'), createevent); 

module.exports = {
    getEvent, findEventByCategory, findEventByTitle, updateEvent,
    deleteEvent, createEvent, editEvent, eventDetails
}
