const express = require('express');
const router = express.Router();
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");

const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");
const { Comment } = require("../models/Comment");
const { auth } = require("../middleware/auth");
//const { restart } = require('nodemon');

//Storage Multer Config
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only mp4 is allowed'), false);
        }
        cb(null, true)
    }
});

const upload = multer({ storage: storage }).single("file");

//=================================
//             Video
//=================================

router.post('/uploadfiles', (req, res) => {
    //save video to server
    upload(req, res ,err =>{
        if(err) {
            return res.json({success: false, err})
        }
        return res.json({success: true, url: res.req.file.path, fileName: res.req.file.filename })
    })
})

router.post('/getVideoDetail', (req, res) => {

    Video.findOne({ "_id" : req.body.videoId })
    .populate('writer')
    .exec((err, videoDetail)=> {
        if(err) return res.status(400).send(err)
        return res.status(200).json({ success:true, videoDetail})
    })
});

router.post('/uploadVideo', (req, res) => {
    //save video info
    const video = new Video(req.body)

    video.save((err, doc) => {
        if(err) return res.json({ success: false, err })
        res.status(200).json({success: true })
    })
})

router.post("/getSubscriptionVideos", (req, res) => {
 
    //Find all of the Users that I am subscribing to From Subscriber Collection 
    Subscriber.find({ userFrom: req.body.userFrom })
    .exec((err, subscriberInfo)=> {
        if(err) return res.status(400).send(err);

        let subscribedUser = [];

        subscriberInfo.map((subscriber, i) => {
            subscribedUser.push(subscriber.userTo)
        })

        //Fetch all of the Videos that belong to the Users that I found in previous step. 
        Video.find({ writer: { $in: subscribedUser }}) // $in - for many people
        .populate('writer')
        .exec((err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
        })

    })
});


router.get('/getVideos', (req, res) => {
    //bring video from DB and send to client
    Video.find()
    .populate('writer')
    .exec((err, videos)=> {
        if(err) return res.status(400).send(err);
        res.status(200).json({ success:true, videos})
    })
})

router.post('/thumbnail', (req, res) => {
    //make thumbnail & check video running time

    let filePath =""
    let fileDuration =""

    //bring video info
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
        console.dir(metadata); //all metadata
        console.log(metadata.format.duration);
        fileDuration = metadata.format.duration
    })

    //make thumbnail
    ffmpeg(req.body.url)
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            console.log(filenames)

            filePath = "uploads/thumbnails/" + filenames[0]
        })
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, url: filePath, fileDuration: fileDuration})
        })
        .on('error', function(err)
        {
            console.error(err);
            return res.json({ success: false, err });
        })
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            // %b input basename ( filename w/o extension )
            filename:'thumbnail-%b.png'
        });

})

router.post("/updateViews", (req, res) => {

    Video.findById(req.body.videoId)
      .populate("writer")
      .exec((err, doc) => {
        if (err) return res.status(400).json({ success: false, err })
        doc.views++;

        doc.save((err) => {
          if (err) return res.status(400).json({ success: false, err })
        })
        res.status(200).json({ success: true, views: doc.views })

      })

  })
  

module.exports = router;
