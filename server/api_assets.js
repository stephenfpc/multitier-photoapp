//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const dbConnection = require('./database.js')

exports.get_assets = async (req, res) => {

  console.log("call to /assets...");

  try {
    var rds_response = new Promise((resolve, reject) => {

      console.log("/assets: calling RDS...");

      var sql = `
      SELECT * FROM assets;
      `;

      dbConnection.query(sql, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("/assets query done");
        resolve(results);
      });
    });

    rds_response.then(results => {
      console.log("/assets done, sending response...");

      res.json({
        "message": "success",
        "data": results
      });
    });

  }
  catch (err) {
    
    res.status(400).json({
      "message": err.message,
      "data": []
    });

  }

}
