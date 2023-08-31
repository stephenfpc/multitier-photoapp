//
// app.post('/image/:userid', async (req, res) => {...});
//
// Uploads an image to the bucket and updates the database,
// returning the asset id assigned to this image.
//
const dbConnection = require('./database.js')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');
const sharp = require('sharp') // for image compression

const uuid = require('uuid');

exports.post_image = async (req, res) => {

  console.log("call to /image...");

  var data = req.body;  // data => JS object
  var image = data.data;
  var name = data.assetname;

  var userid = req.params.userid;
  console.log("userid: " + userid);

  // Decode the base64-encoded image to raw bytes
  var imageBuffer = Buffer.from(image, 'base64');

  // Compress the image using sharp
  const compressedImageBuffer = await sharp(imageBuffer)
    .jpeg({ quality: 10 })  
    .toBuffer();

  try {
    // Get the bucket folder associated with the user id
    var userQuery = `
    SELECT bucketfolder FROM users WHERE userid = ?
    `;

    dbConnection.query(userQuery, userid, async (error, results) => {
      if (error) {
        console.log(error.message);
        res.json({
          "message": error.message,
          "assetid": -1
        });
        return;
      }
      if (results.length === 0) {
        console.log("no such user...");
        res.json({
          "message": "no such user...",
          "assetid": -1
        });
        return;
      }

      var bucketfolder = results[0].bucketfolder;
      console.log("bucketfolder: " + bucketfolder);

      // Generate a unique key for the image in S3
      var key = uuid.v4();

      // Append the bucket key after the folder
      var bucketkey = bucketfolder + '/' + key + '.jpg';
      console.log("bucketkey: " + bucketkey);

      // Upload the image to S3
      await s3.send(new PutObjectCommand({
        Bucket: s3_bucket_name,
        Key: bucketkey,
        Body: compressedImageBuffer
      }));

      // Insert the image metadata into the RDS database
      var assetQuery = `
      INSERT INTO assets(userid, assetname, bucketkey) VALUES(?, ?, ?)
      `;
      var values = [userid, name, bucketkey];

      dbConnection.query(assetQuery, values, (_, results) => {

        // Get the newly generated asset id
        var assetid = results.insertId;

        console.log("/image done, sending response...");

        res.json({
          "message": "success",
          "assetid": assetid
        });
      });
    }) 
  }
  catch (err) {

    res.status(400).json({
      "message": err.message,
      "assetid": -1
    });

  }
}
