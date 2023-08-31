//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const dbConnection = require('./database.js')

exports.put_user = async (req, res) => {

  console.log("call to /user...");

  try {

    var data = req.body;  // data => JS object

    const email = data.email;
    const firstname = data.firstname;
    const lastname = data.lastname;
    const bucketfolder = data.bucketfolder;

    // Check if the email already exists in the database
    const query = `
    SELECT * FROM users WHERE email = ?
    `;

    dbConnection.query(query, email, (error, results) => {

      if (error) {
        console.error('Error selecting from database: ', error.stack);
        res.status(400).json({ message: 'Error selecting from database', userid: -1 });
        return;
      }

      // If the email does not exist in the database, insert a new user
      if (results.length === 0) {
        const insertQuery = `
        INSERT INTO users (email, firstname, lastname, bucketfolder) VALUES (?, ?, ?, ?)
        `;

        dbConnection.query(insertQuery, [email, firstname, lastname, bucketfolder], (error, results) => {
          if (error) {
            console.error('Error inserting into database: ', error.stack);
            res.status(400).json({
              message: 'Error inserting into database',
              userid: -1
            });
            return;
          }

          console.log("/user done, sending response...");
          const userId = results.insertId;
          res.json({
            message: 'inserted',
            userid: userId
          });
        });

        return;
      }

      // If the email already exists in the database, update the user's row
      const updateQuery = `
      UPDATE users SET firstname = ?, lastname = ?, bucketfolder = ? WHERE email = ?
      `;

      dbConnection.query(updateQuery, [firstname, lastname, bucketfolder, email], (error, results) => {
        if (error) {
          console.error('Error updating database: ', error.stack);
          res.status(400).json({
            message: 'Error updating database',
            userid: -1
          });
          return;
        }
      });

      // Retrieve user id
      console.log("/user done, sending response...");
      const userId = results[0].userid;
      res.json({
        message: 'updated',
        userid: userId
      });
    });
  }
  catch (err) {

    res.status(400).json({
      "message": err.message,
      "userid": -1
    });

  }
}
