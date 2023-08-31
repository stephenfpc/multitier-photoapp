//
// app.get('/search?userid=<userid>&lat=<lat>&lng=<longtitude>&date=<YYYY-MM-DD>', async (req, res) => {...});
//
// Given a date or location, search all the matching assets from an user
//
const dbConnection = require('./database.js')
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');


exports.search_image = async (req, res) => {

    try {
        console.log("call to /search...");

        if (!req.query.userid) {
            res.status(400).json({
                "message": "no user_id",
                "data": []
            })
        };


        // if (!req.query.date && !(req.query.lat && req.query.lng)) {
        //     res.status(400).json({
        //         "message": "no search criteria (no date and location)",
        //         "assetids": []
        //     })
        // }

        userid = req.query.userid
        date = req.query.date
        lat = req.query.lat
        lng = req.query.lng

        console.log(`userid: ${userid}, date: ${date}, lat: ${lat}, lng: ${lng}`)
        
        searchSql = `
            SELECT assetid, date_format(from_unixtime(createdtime), '%Y-%m-%d') as date, latitude as lat, longitude as lng
            FROM (select * from photoapp.metadata) metadata
            JOIN (select assetid, userid from photoapp.assets) assets
            USING (assetid)
            WHERE userid = ${dbConnection.escape(userid)}
            AND (
                (${dbConnection.escape(date)} is NULL OR ${dbConnection.escape(date)} = date(from_unixtime(createdtime)))
                AND (${dbConnection.escape(lat)} is NULL OR ${dbConnection.escape(lat)} between latitude-1 AND latitude+1)
                AND (${dbConnection.escape(lng)} is NULL OR ${dbConnection.escape(lng)} between longitude-1 AND longitude+1)
                )
        `;

        // console.log(searchSql)
        dbConnection.query(searchSql, async (err, search_results, _) => {
        
            if (err) {
                res.status(400).json({
                    "message": err.message,
                    "data": []
                });
                return;
            }

            // console.log(`search results: ${JSON.stringify(search_results)}`)
            // assetids = search_results.map(row => row['assetid'])
            // console.log(`assetids: ${assetids}`)

            res.status(200).json({"message": "success",
                    "data": search_results});
        });
    
  } //try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  } //catch

} //get
