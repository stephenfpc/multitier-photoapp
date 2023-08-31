//
// app.get('/download/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const dbConnection = require('./database.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_download = async (req, res) => {

  console.log("call to /download...");
  const assetid = req.params.assetid;

  try {

    var sql = `
    SELECT * FROM assets
    WHERE assetid = ?;
    `;
    
    dbConnection.query(sql, assetid, async (err, rds_results, _) => {

      if (err) {
        res.status(200).json({
          "message": err.message,
          "user_id": -1,
          "asset_name": "?",
          "bucket_key": "?",
          "data": []
        });
        return;
      }
      if (rds_results.length === 0) {
        res.json({
          "message": "no such asset...",
          "user_id": -1,
          "asset_name": "?",
          "bucket_key": "?",
          "data": []
        });
        return;
      } 
      
      console.log("/download query done");

      var rds_data = rds_results[0]
      var userid = rds_data["userid"];
      var assetname = rds_data["assetname"];
      var bucketkey = rds_data["bucketkey"];

      var params = {
        Bucket: s3_bucket_name,
        Key: bucketkey
      };
      var command = new GetObjectCommand(params);
      var s3_results = await s3.send(command);
      var datastr = await s3_results.Body.transformToString("base64");

      console.log("/download done, sending response...");

      res.json({
        "message": "success",
        "user_id": userid,
        "asset_name": assetname,
        "bucket_key": bucketkey,
        "data": datastr
      });
    });

  }
  catch (err) {

    res.status(400).json({
      "message": err.message,
      "user_id": -1,
      "asset_name": "?",
      "bucket_key": "?",
      "data": []
    });
  }

}
