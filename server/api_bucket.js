//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_bucket = async (req, res) => {

  console.log("call to /bucket...");
  var startAfter = req.query.startafter;
  console.log("startafter = " + startAfter);

  try {

    if (startAfter === undefined) {
      var input = {
        Bucket: s3_bucket_name,
        MaxKeys: 12,
      };
    } else {
      var input = {
        Bucket: s3_bucket_name,
        MaxKeys: 12, // retrieve 12 items at a time
        StartAfter: startAfter // start after the specified bucket key
      };
    }

    console.log("/bucket: calling S3...");

    var command = new ListObjectsV2Command(input);
    var data = await s3.send(command);
    const contents = data.Contents;
    const truncated = data.IsTruncated;
    const nextKey = truncated ? contents[contents.length - 1].Key : null;

    // Special case when the contents do not exist
    if (contents === undefined) {
      res.json({
        "message": "success",
        "data": []
      });
      return;
    }
    
    res.json({
      "message": "success",
      "data": contents,
      "truncated": truncated,
      "nextKey": nextKey
    });

    //
    // TODO: remember, 12 at a time...  Do not try to cache them here, instead 
    // request them 12 at a time from S3
    //
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //

  }
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }
}
