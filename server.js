const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    limits: {fileSize: 50 * 2024 * 1024}
}))
app.use(cors())

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.SECRET,
    secure: true,
});

// connecting to DB
mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connected to DB!")).catch((err) => console.log(err));

// schema and model
const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String
    }
})

const Image = mongoose.model("Image", imageSchema);

// get all posts
app.get("/all", async (req, res) => {
    try {
        const fetcPosts = await Image.find({});
        return res.status(200).json({
            success: true,
            message: "Post Fetch Success!",
            data :fetcPosts
        })
        // res.json(fetcPosts)
    } catch (error) {
        return res.json(error)
    }
})


// create new post
app.post("/upload/cloud", async (req, res) => {
    let imgUrl ;
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
        folder: "image"
    })

    res.status(201).json({
        success: true,
        message: "Image Uploaded"
    })

    imgUrl = result.secure_url

    const newUpload = new Image({
        imageUrl :imgUrl
    })

    newUpload.save().then(() => {
        res.status(200).json({
            success:true,
            data:{
                imgUrl
            },
            message: "Image uploaded successfully!"
        })
    }).catch((err) => res.status(400).json({
        success:false,
        message: `${err}`
    }))

})




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server up and running")
})