const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
});
pool.connect();

// Use JSON middleware to parse incoming JSON data
app.use(express.json());

app.use(express.static(`client`));

//set up a test route
app.get("/test", (req, res) => {
  res.send({ hello: "world" });
});

// Read all people
app.get("/api/people", (req, res) => {
  pool.query(`SELECT * FROM people ORDER BY id;`).then((result) => {
    //console.log(result.rows);
    res.json(result.rows);
  });
});

// Read a specific person
app.get("/api/people/:id", (req, res) => {
  let id = req.params.id;
  if (isNaN(id)) {
    res.status(404).send("Enter a valid person id.");
    return;
  }
  // This complicated query will fetch all of the data I want in one table
  pool
    .query(
      `SELECT 
  p.*,
  string_agg(h.name, ', ') AS hobby_names,
  string_agg(h.materials_required, ' | ') AS all_materials_required
FROM 
  people p 
  LEFT JOIN hobbies h ON h.hobby_id IN (p.hobby1, p.hobby2, p.hobby3)
WHERE 
  p.id = $1
GROUP BY 
  p.id;`,
      [id]
    )
    .then((result) => {
      //This code below only fetches hobby Id's from person table
      //pool.query(`SELECT * FROM people WHERE id = $1;`, [id]).then((result) => {
      if (result.rows.length === 0) {
        res.status(404).send("The person you are looking for is not here.");
        return;
      } else {
        res.send(result.rows[0]);
      }
    });
});

// Create a new person
app.post("/api/people", (req, res) => {
  let member = req.body;
  if (!member.name || !member.bday) {
    res.status(400).send("You need a name and a bday");
    return;
  } else if (
    isNaN(member.hobby1) ||
    isNaN(member.hobby2) ||
    isNaN(member.hobby3) ||
    member.hobby1 > 16 ||
    member.hobby2 > 16 ||
    member.hobby3 > 16
  ) {
    res.status(400).send("Please enter a valid hobby number from the list.");
    return;
  } else {
    pool
      .query(
        `INSERT INTO people (name, nickname, fav_color, location, bday, hobby1, hobby2, hobby3) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [
          member.name,
          member.nickname,
          member.fav_color,
          member.location,
          member.bday,
          member.hobby1,
          member.hobby2,
          member.hobby3,
        ]
      )
      .then((result) => {
        res.status(201).send(result.rows[0]);
      });
  }
});

// Delete a person
app.delete("/api/people/:id", (req, res) => {
  let id = req.params.id;
  console.log(id);
  if (isNaN(id)) {
    res.status(404).send("Enter a valid person id.");
    return;
  }
  pool.query(`SELECT * FROM people WHERE id = $1;`, [id]).then((result) => {
    if (result.rows.length === 0) {
      res
        .status(404)
        .send("The person you are trying to delete is already not here.");
      return;
    } else {
      pool
        .query(`DELETE FROM people WHERE id = $1 RETURNING *;`, [id])
        .then((result) => {
          const deletedPersonId = result.rows[0].id;
          const deletedPersonName = result.rows[0].name;
          res
            .status(200)
            .send(
              `(${deletedPersonId}. ${deletedPersonName}) has been deleted.`
            );
        });
    }
  });
});

//Update a Person
// My new code here:

app.patch("/api/people/:id", (req, res) => {
  // let personId = req.params.id;
  // let { name } = req.body;
  // let { nickname } = req.body;
  // let { fav_color } = req.body;
  // let { location } = req.body;
  // let bday = req.body.bday;
  // let { hobby1 } = req.body;
  // let { hobby2 } = req.body;
  // let { hobby3 } = req.body;
  // let values = [
  //   name || null,
  //   nickname || null,
  //   fav_color || null,
  //   location || null,
  //   bday || null,
  //   hobby1 || null,
  //   hobby2 || null,
  //   hobby3 || null,
  //   personId,
  // ];
  // console.log(values);
  // let query = `UPDATE people SET name COALESCE($1, name)  WHERE id=$9 RETURNING *`;
  // pool(query, values).then((results) => {
  //   console.log(results);
  // });
  let personId = req.params.id;
  if (isNaN(personId)) {
    res.status(404).send("Enter a valid person id.");
    return;
  }
  pool
    .query(`SELECT * FROM people WHERE id = $1`, [personId])
    .then((result) => {
      //console.log(result.rows);
      if (result.rows.length === 0) {
        console.log("This person doesn't exist.");
        res.status(404).send("This person doesn't exist.");
        return;
      } else {
        //let key = Object.keys(req.body)[0];
        //let value = Object.values(req.body)[0];
        // Iterate over all key-value pairs in request body
        let updatedFields = {};
        Object.entries(req.body).forEach(([key, value]) => {
          // Update the necessary field in the database
          pool
            .query(`UPDATE people SET ${key}=$1 WHERE id=$2 RETURNING *`, [
              value,
              personId,
            ])
            .then((result) => {
              result = result.rows[0];
              updatedFields[key] = value;
              //res.send(result);
              console.log(`Updated ${key} to ${value}`);
              // Check if all fields have been updated
              if (
                Object.keys(updatedFields).length ===
                Object.keys(req.body).length
              ) {
                // Fetch the updated person record and return it as the response
                pool
                  .query(`SELECT * FROM people WHERE id = $1`, [personId])
                  .then((result) => {
                    res.send(result.rows[0]);
                  })
                  .catch((error) => {
                    console.error(
                      `Failed to fetch updated person record: ${error}`
                    );
                    res.status(500).send("Internal Server Error");
                  });
              }
            })
            .catch((error) => {
              res.status(500).send(`Failed to update ${key}: ${error}`);
              console.error(`Failed to update ${key}: ${error}`);
            });
        });
      }
    })
    .catch((error) => {
      console.error(`Failed to fetch person record: ${error}`);
      res.status(500).send("Internal Server Error");
    });
});

//start the server running
app.listen(PORT, (error) => {
  if (error) console.log(error);
  else {
    console.log(`Listening on port: ${PORT}`);
  }
});
