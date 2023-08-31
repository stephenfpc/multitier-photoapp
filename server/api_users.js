//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require('./database.js')

exports.get_users = async (req, res) => {

  console.log("call to /users...");

  try {

    var rds_response = new Promise((resolve, reject) => {

      console.log("/users: calling RDS...");

      var sql = `
      SELECT * FROM users;
      `;

      dbConnection.query(sql, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("/users query done");
        resolve(results);
      });
    });

    rds_response.then(results => {
      console.log("/users done, sending response...");

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
