import multer from "multer";
import HomePageImages from "../models/homePageImages";
import {Request,Response} from 'express';
import path from "path";
import fs, { rmSync } from 'fs';

// Set up Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/skillOnTimeHomePageSliderImage'); // Directory where profile pictures will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
  });
  
  const upload = multer({ storage: storage }).single('imageUrl'); // Handling a single file upload

  

  export const SkillOnTimeHomePageImageSliderFunction = async (req: Request, res: Response) => {
    const {id }= req.params;
    if (!id) {
        return res.status(400).json({ message: "imageId is required in params", id :req.body});
      }

    upload(req, res, async (err :any) => {
      if (err) {
        return res.status(500).json({ message: "File upload failed", error: err });
      }
  
      try {
      if (!id) {
        return res.status(400).json({ message: "imageId is required", id });
      }
  
      if(!req.body.title){
          return res.status(400).send({message : 'title is required', data :req.body.title})
      }

      let title = req.body.title;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      // Find the student to get the current profile photo path
      const HomePageImage = await HomePageImages.findOne({
        where: { ImageId: id, title : title },
        attributes: ['imageUrl']
      });
  
      if (!HomePageImage) {
        let data = {
            imageUrl: `/uploads/skillOnTimeHomePageSliderImage/${req.file.filename}`,
            ImageId: id,
            title : title
          }
          const course = await HomePageImages.create(data);
          return res.status(404).json({ message: "image  uploaded" ,course:course});
      }
  

    if (HomePageImage.imageUrl) {
      // Delete the old file if it exists
      const oldFileName = path.basename(HomePageImage.imageUrl);
      const oldFilePath = path.resolve('uploads/skillOnTimeHomePageSliderImage', oldFileName);
    
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old homepage photo:", err);
        }
      });
    }
    
    // Log the new image URL for debugging
    console.log("Updating database with new image URL:", `/uploads/skillOnTimeHomePageSliderImage/${req.file.filename}`);
    
    // Update the record with the new image path
    const [updateCount] = await HomePageImages.update(
      { imageUrl: `/uploads/skillOnTimeHomePageSliderImage/${req.file.filename}` },
      { where: { ImageId: id ,title:title} }
    );
    
    // Log the result of the update operation
    console.log("Number of records updated:", updateCount);
    
    if (updateCount === 0) {
      return res.status(404).json({ message: "Image record not found or not updated" });
    }
    
    return res.status(200).json({ message: "Home page photo updated successfully" });
    
     
  
      return res.status(200).json({ message: "home page photo updated successfully" });
        } catch (error) {
          res.status(500).json({ message: "Internal server error", error });
        }
    });
  };


  export const SkillOnTimeHomePageImageSliderGetAllFunction = async (req: Request, res: Response) => {
      try {
      // Find the student to get the current profile photo path
      const HomePageImage = await HomePageImages.findAll({
        attributes: ['imageUrl','ImageId', "title"]
      });
    
      const groupedImages = HomePageImage.reduce((acc: any, image: any) => {
        const titleKey = image.title.toLowerCase(); // Assuming title is either 'small screen' or 'big screen'
        if (!acc[titleKey]) {
          acc[titleKey] = [];
        }
        acc[titleKey].push(image);
        return acc;
      }, {});
  
      return res.status(200).send({
        message: 'All images fetched',
        data: {
          smallScreen: groupedImages['small screen'] || [],
          bigScreen: groupedImages['big screen'] || []
        }
      });
    }
      catch(error){
        return res.send({message : 'internal server errir', data : error})
      }
}


export const deleteHomePageSliderImageById = async (req: Request, res: Response) => {
  const { id } = req.params; // Image ID from URL

  try {
    // Find the image by ID
    const image = await HomePageImages.findByPk(id);

    if (!image) {
      return res.status(404).send({
        message: 'Image not found',
      });
    }

    // Get the image file path
    const imagePath = path.join('/uploads/skillOnTimeHomePageSliderImage', path.basename(image.imageUrl));

    // Delete the image file
    // const oldFileName = path.basename(image.imageUrl);
    // const oldFilePath = path.resolve('uploads/skillOnTimeHomePageSliderImage', oldFileName);
  
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting old homepage photo:", err);
      }
    });

    // Delete the image record from the database
    await image.destroy();

    return res.status(200).send({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Internal server error',
      data: error,
    });
  }
};