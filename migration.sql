DROP TABLE if EXISTS people;
DROP TABLE if EXISTS hobbies;

CREATE TABLE hobbies (
hobby_id serial PRIMARY KEY,
name text,
time_cost varchar(10),
skill_required boolean,
materials_required text
);

CREATE TABLE people (
id serial PRIMARY KEY,
name varchar(20),
nickname varchar(20),
fav_color varchar(20),
location varchar(30),
bday varchar(20),
hobby1 integer REFERENCES hobbies(hobby_id),
hobby2 integer REFERENCES hobbies(hobby_id),
hobby3 integer REFERENCES hobbies(hobby_id),
image text
);

-- list of hobbies:
-- 1 - reading
-- 2 - videogames
-- 3 - hiking
-- 4 - running
-- 5 - outdoors
-- 6 - boardgames
-- 7 - skateboarding
-- 8 - cooking
-- 9 - traveling
-- 10 - arts/crafts
-- 11 - cardgames
-- 12 - collecting
-- 13 - gardening
-- 14 - legos
-- 15 - watching tv
-- 16 - bikeriding