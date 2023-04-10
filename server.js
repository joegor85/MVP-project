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

app.get("/api/people/:id", (req, res) => {
  let id = req.params.id;
  if (isNaN(id)) {
    res.status(404).send("Enter a valid person id.");
    return;
  }
  pool.query(`SELECT * FROM people WHERE id = $1;`, [id]).then((result) => {
    console.log(result);
    if (result.rows.length === 0) {
      // Need to figure out why it's not returning 404
      res.status(404).send("The person you are looking for is not here.");
      return;
    } else {
      res.send(result.rows[0]);
    }
  });
});

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
        res.send(member);
      });
  }
});

app.delete("/api/people/delete", (req, res)=> {

});

//start the server running
app.listen(PORT, (error) => {
  if (error) console.log(error);
  else {
    console.log(`Listening on port: ${PORT}`);
  }
});
