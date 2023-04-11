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

//set up a test route
app.get("/", (req, res) => {
  res.send({ hello: "world" });
});

// Read a specific person
app.get("/api/people/:id", (req, res) => {
  let id = req.params.id;
  if (isNaN(id)) {
    res.status(404).send("Enter a valid person id.");
    return;
  }
  pool.query(`SELECT * FROM people WHERE id = $1;`, [id]).then((result) => {
    if (result.rows.length === 0) {
      res.status(404).send("The person you are looking for is not here.");
      return;
    } else {
      res.send(result.rows[0]);
    }
  });
});

// Create a new person
app.post("/api/people/post", (req, res) => {
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
        `INSERT INTO people (name, nickname, fav_color, location, bday, hobby1, hobby2, hobby3) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
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
        res.status(201).send(member);
      });
  }
});

// Delete a person
app.delete("/api/people/delete/:id", (req, res) => {
  let id = req.params.id;
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
          //console.log(result);
          //console.log(result.rows[0].name);
          res.status(200).send(`${result.rows[0].name} has been deleted`);
        });
    }
  });
});

//Update a Person
// My new code here:

app.patch("/api/people/patch/:id", (req, res) => {
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
