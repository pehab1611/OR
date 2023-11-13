// start with node index
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('scrips'));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'OR_Labos',
  password: 'yxcv',
  port: 5432,
});

app.get('/', async(req, res) => {
  res.render('index', {});
})

app.get('/datatable', async (req, res) => {
  const proba = req.query;
  console.log(proba);

  //GETTING TEAMS AND DRIVERS DATA FROM THE DATABASE 
  const query = `(SELECT JSON_AGG(ROW_TO_JSON(result)) FROM (SELECT *
    FROM teams NATURAL JOIN driverInTeam NATURAL JOIN drivers 
  ) result)`;
  try {
    const result = await pool.query(query);
    table = result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
  };
  console.log(table[0].json_agg);
  console.log(Object.keys(table[0].json_agg[0]));

  res.render('datatable', {teams : table[0].json_agg, columns: Object.keys(table[0].json_agg[0])});
});

async function getQuery(query) {
  try {
    const result = await pool.query(query);
    data = result.rows[0].json_agg;
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error executing query:', error);
    return null;
  };
}

app.get('/data', async(req, res) => {
  const text = req.query.text;
  const category = req.query.category;
  console.log(text, category);

  var query = '';

  if(category == 'wildcard') {
    query = `(SELECT JSON_AGG(ROW_TO_JSON(result)) FROM (SELECT *
      FROM teams NATURAL JOIN driverInTeam NATURAL JOIN drivers WHERE 
      LOWER(teamName::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverNum::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverName::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverLast::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(nationality::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(teamBase::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(teamChief::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(chassis::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(powerUnit::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(firstEntry::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(teamChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(highestRaceFinish::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(polePosition::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(fastestLaps::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(points::text) LIKE '%' || LOWER('` + text + `') || '%'
      ) result)`
  } else {
    query = `(SELECT JSON_AGG(ROW_TO_JSON(result)) FROM (SELECT *
      FROM teams NATURAL JOIN driverInTeam NATURAL JOIN drivers WHERE LOWER(` 
      + category + `::text) LIKE '%' || LOWER('` + text + `') || '%') result)`
  }
  data = await getQuery(query);

  res.send({'data' : data});
});

//return CSV string 
app.get('/csv', async(req, res) => {
  const text = req.query.text;
  const category = req.query.category;
  console.log(text, category);

  var query = '';

  if(category == 'wildcard') {
    query = `(SELECT JSON_AGG(ROW_TO_JSON(result)) FROM (SELECT *
      FROM teams NATURAL JOIN driverInTeam NATURAL JOIN drivers WHERE 
      LOWER(teamName::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverNum::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverName::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverLast::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(nationality::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(teamBase::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(teamChief::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(chassis::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(powerUnit::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(firstEntry::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(teamChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(driverChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(highestRaceFinish::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(polePosition::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(fastestLaps::text) LIKE '%' || LOWER('` + text + `') || '%'
      OR LOWER(points::text) LIKE '%' || LOWER('` + text + `') || '%'
      ) result)`
  } else {
    query = `(SELECT JSON_AGG(ROW_TO_JSON(result)) FROM (SELECT *
      FROM teams NATURAL JOIN driverInTeam NATURAL JOIN drivers WHERE LOWER(` 
      + category + `::text) LIKE '%' || LOWER('` + text + `') || '%') result)`
  }
  data = await getQuery(query);

  //Ak je prazno saljemo null
  if (!data) {
    res.send({'data' : null});
  }

  var str = '';
  var i = 0;
  Object.keys(data[0]).forEach(el => {
    str += el;
    i++;
    if (i < Object.keys(data[0]).length) str += ';';
  })
  str += '\r\n';

  data.forEach(row => {
    var i = 0;
    Object.keys(data[0]).forEach(el => {
      str += row[el];
      i++;
      if (i < Object.keys(data[0]).length) str += ';';
    })
    str += "\r\n";
  });
  console.log
  res.send({'data' : str});
});

//return json 
app.get('/json', async(req, res) => {
  const text = req.query.text;
  const category = req.query.category;
  console.log(text, category);

  var query = '';

  if (category == 'wildcard') {
    query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
        FROM (
          SELECT *, 
              (
              SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                      FROM (
                          SELECT driverNum, driverName, driverLast, nationality
                          FROM drivers NATURAL JOIN driverInTeam
                          WHERE teams.teamName = driverInTeam.teamName AND (
                            LOWER(driverNum::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR LOWER(driverName::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR LOWER(driverLast::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR LOWER(nationality::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR teams.teamName IN (SELECT teamName FROM teams WHERE 
                              LOWER(teamName::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(teamBase::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(teamChief::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(chassis::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(powerUnit::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(firstEntry::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(teamChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(driverChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(highestRaceFinish::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(polePosition::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(fastestLaps::text) LIKE '%' || LOWER('` + text + `') || '%'
                              OR LOWER(points::text) LIKE '%' || LOWER('` + text + `') || '%')
                          )
                  ) AS driver_data
              ) AS drivers
          FROM teams
          WHERE teamName IN 
            (SELECT teamName FROM driverInTeam NATURAL JOIN drivers 
              WHERE teams.teamName = driverInTeam.teamName AND (
                LOWER(driverNum::text) LIKE '%' || LOWER('` + text + `') || '%'
                OR LOWER(driverName::text) LIKE '%' || LOWER('` + text + `') || '%'
                OR LOWER(driverLast::text) LIKE '%' || LOWER('` + text + `') || '%'
                OR LOWER(nationality::text) LIKE '%' || LOWER('` + text + `') || '%'
            )) 
            OR LOWER(teamName::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(teamBase::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(teamChief::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(chassis::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(powerUnit::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(firstEntry::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(teamChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(driverChampionships::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(highestRaceFinish::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(polePosition::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(fastestLaps::text) LIKE '%' || LOWER('` + text + `') || '%'
            OR LOWER(points::text) LIKE '%' || LOWER('` + text + `') || '%'
      ) result)`
  } else {
    driver_car = ['drivernum', 'drivername', 'driverlast', 'nationality'];
    if (driver_car.includes(category)) {
      query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
          FROM (
            SELECT *, 
                (
                SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                        FROM (
                            SELECT driverNum, driverName, driverLast, nationality
                            FROM drivers NATURAL JOIN driverInTeam
                            WHERE teams.teamName = driverInTeam.teamName AND 
                              LOWER(` + category + `::text) LIKE '%' || LOWER('` + text + `') || '%'
                    ) AS driver_data
                ) AS drivers
            FROM teams
            WHERE teamName IN 
              (SELECT teamName FROM driverInTeam NATURAL JOIN drivers 
                WHERE teams.teamName = driverInTeam.teamName 
                AND LOWER(` + category + `::text) LIKE '%' || LOWER('` + text + `') || '%'
              ) 
        ) result)`    
    } else {
      query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
      FROM (
        SELECT *, 
            (
            SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                    FROM (
                        SELECT driverNum, driverName, driverLast, nationality
                        FROM drivers NATURAL JOIN driverInTeam
                        WHERE teams.teamName = driverInTeam.teamName AND 
                          teams.teamName IN (SELECT teamName FROM teams WHERE 
                            LOWER(` + category + `::text) LIKE '%' || LOWER('` + text + `') || '%'
                        )
                ) AS driver_data
            ) AS drivers
        FROM teams WHERE
          LOWER(` + category + `::text) LIKE '%' || LOWER('` + text + `') || '%'
    ) result)`
    }
  }
  data = await getQuery(query);
  console.log(data);

  res.send({'data': data});
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});