// start with node index
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const fs = require('fs');
const { auth } = require('express-openid-connect');
const ngrok = require("@ngrok/ngrok");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('scrips'));
app.use(bodyParser.json());

function addLD(data) {
  schemaDriver = {
    "@context" : {
      "@vocab": "http://schema.org/",
      "drivername" : "givenName",
      "driverlast" : "familyName",
      "drivernum" : "identifier"
    },
    "@type" : "Person"
  }
  const mergedData = Object.assign({}, data, schemaDriver);
  return mergedData;
}

const config = {
  authRequired: false,
  auth0Logout: false,
  session: { cookie: { transient: true } },
  idpLogout: false,
  secret: 'ptPgQFvAGEdad4770zSg4FeP8G49hdEHTW6RflsTL3axa1Uob1kf-VZvPBvLI3y5',
  baseURL: 'http://localhost:3000',
  clientID: 'iEwjbunvfkQGUUM0OBS3pnyhV0fSGhs8',
  issuerBaseURL: 'https://dev-fl0qzyhemkgqgl2t.us.auth0.com'
};

(async function () {
	const listener = await ngrok.forward({
		addr: 3000,
    authtoken: '2aWsPeWVhmvo9EnJJ7jkxbTJPOY_5bANXHvWiWYiezbenEsnP'
	});

	console.log(`Ingress established at: ${listener.url()}`);
})();

app.use(auth(config));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'new_OR_Labos',
  password: 'yxcv',
  port: 5432,
});

async function getQuery(query) {
  try {
    const result = await pool.query(query);
    data = result.rows[0].json_agg;
    return data;
  } catch (error) {
    console.error('Error executing query:', error);
    return null;
  };
}

app.get('/api/v1/data', async(req, res) => {
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
  FROM (
    SELECT *, 
        (
        SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                FROM (
                    SELECT driverNum, driverName, driverLast, nationality
                    FROM drivers NATURAL JOIN driverInTeam
                    WHERE teams.id = driverInTeam.id AND 
                      teams.id IN (SELECT id FROM teams)
            ) AS driver_data
        ) AS drivers
    FROM teams) result)`;
  data = await getQuery(query);
  if(data) {
    for (const team of data) {
      for (let i = 0; i < team['drivers'].length; i++) {
        team['drivers'][i] = await addLD(team['drivers'][i]);
      }
    }
    res.status(200).json({ status: 'OK', message: 'List of all data', response : data});
  } else {
    res.status(404).json({ status: 'Empty database', message: 'Empty data base', response : data});
  }
});

app.get('/api/v1/data/:id', async(req, res) => {
  const id = req.params.id;
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
  FROM (
    SELECT *, 
        (
        SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                FROM (
                    SELECT driverNum, driverName, driverLast, nationality
                    FROM drivers NATURAL JOIN driverInTeam
                    WHERE teams.id = driverInTeam.id AND 
                      teams.id IN (SELECT id FROM teams)
            ) AS driver_data
        ) AS drivers
    FROM teams WHERE teams.id = '` + id + `') result)`;
  data = await getQuery(query);
  if (!data) {
    res.status(404).json({ status: 'Error', message: 'Wrong id', response : null});
  } else {
    for (const team of data) {
      for (let i = 0; i < team['drivers'].length; i++) {
        team['drivers'][i] = await addLD(team['drivers'][i]);
      }
    }
    res.status(200).json({ status: 'OK', message: 'Data for team ' + id, response : data[0]});
  }
});

app.get('/api/v1/team/:id', async(req, res) => {
  //samo tim po id-u
  const id = req.params.id;
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(teams))
    FROM teams WHERE teams.id = '` + id + `')`;
  try {
    data = await getQuery(query);
    if(data) {
      res.status(200).json({ status: 'OK', message: 'Data for team ' + id, response : data});
    } else {
      res.status(404).json({ status: 'Error', message: 'Wrong id', response : null});
    }
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response : null});
  }
});

app.get('/api/v1/driver/:id', async(req, res) => {
  //samo vozac po id-u
  const id = req.params.id;
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(drivers))
    FROM drivers WHERE drivers.driverNum = '` + id + `')`;
  try {
    data = await getQuery(query);
    if(data) {
      for (let i = 0; i < data.length; i++) {
        data[i] = await addLD(data[i]);
      }
      res.status(200).json({ status: 'OK', message: 'Data for drivers of ' + id, response : data});
    } else {
      res.status(404).json({ status: 'Error', message: 'Wrong id', response : null});
    }
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response : null});
  }
});

app.get('/api/v1/drivers/:id', async(req, res) => {
  //vozači za tima po id-u
  const id = req.params.id;
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(drivers))
    FROM drivers NATURAL JOIN driverInTeam NATURAL JOIN teams WHERE teams.id = '` + id + `')`;
  try {
    data = await getQuery(query);
    if(data) {
      for (let i = 0; i < data.length; i++) {
        data[i] = await addLD(data[i]);
      }
      res.status(200).json({ status: 'OK', message: 'Data for team ' + id + ' drivers', response : data});
    } else {
      res.status(404).json({ status: 'Error', message: 'Wrong id', response : null});
    }
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response : null});
  }
});

app.post('/api/v1/data', async (req, res) => {
  const { teamName, teamBase, teamChief, chassis, powerUnit, firstEntry, teamChampionships, driverChampionships, highestRaceFinish, polePositions, fastestLaps, points, drivers } = req.body;
  if (teamName && teamBase && teamChief && chassis && powerUnit && firstEntry.toString() && teamChampionships.toString() && driverChampionships.toString() && highestRaceFinish.toString() && polePositions.toString() && fastestLaps.toString() && points.toString() && drivers && !isNaN(firstEntry) && !isNaN(teamChampionships) && !isNaN(driverChampionships) && !isNaN(highestRaceFinish) && !isNaN(polePositions) && !isNaN(fastestLaps) && !isNaN(points)) {
    try {
      if(chassis.length > 10) {
        throw new Error(`Chassis can have maximum of 10 characters`);
      }
      const driverPromises = drivers.map(async (elem) => {
        const driverQuery = `SELECT * FROM drivers WHERE driverNum =` + elem.driverNum;
        const driverCheck = await pool.query(driverQuery);
        if (driverCheck.rows.length > 0) {
          throw new Error(`Driver with number ` + elem.driverNum + ` already exists`);
        }
      });
      await Promise.all(driverPromises);
      const driverPromises1 = drivers.map(async (elem) => {
        if (!elem.driverName || !elem.driverLast || !elem.driverNum || !elem.nationality || isNaN(elem.driverNum)) {
          throw new Error('Invalid data for driver');
        }
      })
      await Promise.all(driverPromises1);
      query = `INSERT INTO teams(teamName, teamBase, teamChief, chassis, powerUnit, firstEntry, teamChampionships, driverChampionships, highestRaceFinish, polePosition, fastestLaps, points) VALUES ('${teamName}', '${teamBase}', '${teamChief}', '${chassis}', '${powerUnit}', '${firstEntry}', '${teamChampionships}', '${driverChampionships}', '${highestRaceFinish}', '${polePositions}', '${fastestLaps}', '${points}')
          RETURNING id`;
      const data = await pool.query(query);
      const insertedId = data.rows[0].id;
      drivers.forEach(async driver => {
        const insDriver = `INSERT INTO drivers(driverName, driverLast, driverNum, nationality) VALUES ('${driver.driverName}', '${driver.driverLast}', '${driver.driverNum}', '${driver.nationality}')`;
        const data1 = await pool.query(insDriver);
        const insDiT =  `INSERT INTO driverInTeam(id, driverNum) VALUES ('${insertedId}', '${driver.driverNum}')`
        const data2 = await pool.query(insDiT);
      });
      res.status(200).json({ status: 'Success', message: 'Team added successfully', response: {id : insertedId} });
    } catch (err) {
      res.status(404).json({ status: 'Error', message: err.message, response: null });
    }
  } else {
    res.status(404).json({ status: 'Error', message: 'Invalid data provided', response: null });
  }
});

app.put('/api/v1/data/:id', async (req, res) => {
  const id = req.params.id;
  const { teamName, teamBase, teamChief, chassis, powerUnit, firstEntry, teamChampionships, driverChampionships, highestRaceFinish, polePositions, fastestLaps, points, drivers } = req.body;
  var doIt = true;
  try {
    if((firstEntry && isNaN(firstEntry)) || (teamChampionships && isNaN(teamChampionships)) || (driverChampionships && isNaN(driverChampionships)) || (highestRaceFinish && isNaN(highestRaceFinish)) || (polePositions && isNaN(polePositions)) || (fastestLaps && isNaN(fastestLaps)) || (points && isNaN(points))) {
      doIt = false;
      throw new Error(`Invalid data type`);
    } 
    var query = `(SELECT * FROM teams WHERE id = '` + id + `')`;
    const t = await pool.query(query);
    if(t.rows.length == 0) {
      res.status(404).json({status: 'Does not exist', message: 'Team with id ' + id + ' does not exist', response: null});
      return;
    }
    if(chassis && chassis.length > 10) {
      doIt = false;
      throw new Error(`Chassis can have maximum of 10 characters`);
    }
    if(drivers && doIt){
      const driverPromises = drivers.map(async (driver) => {
        const driverQuery = `SELECT * FROM drivers NATURAL JOIN driverInTeam NATURAL JOIN teams WHERE drivers.driverNum = ` + driver.driverNum + ` AND teams.id != '` + id + `'`;
        const driverCheck = await pool.query(driverQuery);
        if (driverCheck.rows.length > 0) {
          throw new Error(`Driver with number ` + driver.driverNum + ` already exists in another team`);
        }
      });
      await Promise.all(driverPromises);
      const driverNums = await pool.query(`SELECT driverNum FROM driverInTeam WHERE id = '` + id + `'`);
      const driverPromises1 = driverNums.rows.map(async (driver) => {
        const driverQuery = `DELETE FROM driverInTeam WHERE driverNum = ` + driver.drivernum;
        const driverCheck = await pool.query(driverQuery);
        const driverQuery1 = `DELETE FROM drivers WHERE driverNum = ` + driver.drivernum;
        const driverCheck1 = await pool.query(driverQuery1);
      });
      await Promise.all(driverPromises1);
      if(teamName) {
        const q = `UPDATE teams SET teamName = '${teamName}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(teamBase) {
        const q = `UPDATE teams SET teamBase = '${teamBase}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(teamChief) {
        const q = `UPDATE teams SET teamChief = '${teamChief}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(chassis) {
        const q = `UPDATE teams SET chassis = '${chassis}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(powerUnit) {
        const q = `UPDATE teams SET powerUnit = '${powerUnit}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(firstEntry) {
        const q = `UPDATE teams SET firstEntry = '${firstEntry}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(teamChampionships) {
        const q = `UPDATE teams SET teamChampionships = '${teamChampionships}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(driverChampionships) {
        const q = `UPDATE teams SET driverChampionships = '${driverChampionships}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(highestRaceFinish) {
        const q = `UPDATE teams SET highestRaceFinish = '${highestRaceFinish}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(polePositions) {
        const q = `UPDATE teams SET polePosition = '${polePositions}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(fastestLaps) {
        const q = `UPDATE teams SET fastestLaps = '${fastestLaps}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      if(points) {
        const q = `UPDATE teams SET points = '${points}' WHERE id = '${id}'`;
        const data = await pool.query(q);
      }
      const driverPromises2 = drivers.map(async (driver) => {
        const insDriver = `INSERT INTO drivers(driverName, driverLast, driverNum, nationality) VALUES ('${driver.driverName}', '${driver.driverLast}', '${driver.driverNum}', '${driver.nationality}')`;
        const data1 = await pool.query(insDriver);
        const insDiT =  `INSERT INTO driverInTeam(id, driverNum) VALUES ('${id}', '${driver.driverNum}')`
        const data2 = await pool.query(insDiT);
      });
      await Promise.all(driverPromises2);
      res.status(200).json({ status: 'Success', message: 'Team edited successfully', response: null });
    }
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response: null });
  }
});

app.delete('/api/v1/data/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const query1 = `SELECT * FROM teams WHERE id = '${id}'`;
    const data = await pool.query(query1);
    if(data.rows.length == 0) {
      throw new Error(`Team with id ` + id + ` does not exist`);
    }
    const query2 = `SELECT * FROM driverInTeam WHERE id = '${id}'`
    const driverNums = await pool.query(query2);
    const query4 = `DELETE FROM driverInTeam WHERE id = '${id}'`
    const data2 = await pool.query(query4);
    const query3 = `DELETE FROM teams WHERE id = '${id}'`;
    const data3 = await pool.query(query3);
    driverNums.rows.forEach(async driver => {
      const query5 = `DELETE FROM drivers WHERE driverNum = '${driver.drivernum}'`;
      const data4 = await pool.query(query5);
    })
    res.status(200).json({ status: 'Success', message: 'Team removed successfully', response: null })
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response: null });
  }
});

app.get('/api/v1/openapi', (req, res) => {
  fs.readFile('openapi.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    const jsonData = JSON.parse(data);
    res.status(200).json({ status: 'Success', message: `Here's the openapi scheme`, response: jsonData});
  });
});

app.get('/', (req, res) => {
  res.render('index', {auth : req.oidc.isAuthenticated()});
})

app.get('/profile', (req, res) => {
  res.render('profile', {user : req.oidc.user});
})

app.get('/logoutmy', (req, res) => {
  req.session.destroy(() => {
    res.redirect(logoutUri);
  });
})

app.get('/datatable', async (req, res) => {
  const proba = req.query;
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

  res.render('datatable', {teams : table[0].json_agg, columns: Object.keys(table[0].json_agg[0])});
});

async function getQuery(query) {
  try {
    const result = await pool.query(query);
    data = result.rows[0].json_agg;
    return data;
  } catch (error) {
    console.error('Error executing query:', error);
    return null;
  };
}

app.get('/search', async(req, res) => {
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
                          WHERE teams.id = driverInTeam.id AND (
                            LOWER(driverNum::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR LOWER(driverName::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR LOWER(driverLast::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR LOWER(nationality::text) LIKE '%' || LOWER('` + text + `') || '%'
                            OR teams.id IN (SELECT id FROM teams WHERE 
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
          WHERE id IN 
            (SELECT id FROM driverInTeam NATURAL JOIN drivers 
              WHERE teams.id = driverInTeam.id AND (
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
                            WHERE teams.id = driverInTeam.id AND 
                              LOWER(` + category + `::text) LIKE '%' || LOWER('` + text + `') || '%'
                    ) AS driver_data
                ) AS drivers
            FROM teams
            WHERE id IN 
              (SELECT id FROM driverInTeam NATURAL JOIN drivers 
                WHERE teams.id = driverInTeam.id 
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
                        WHERE teams.id = driverInTeam.id AND 
                          teams.id IN (SELECT id FROM teams WHERE 
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

  res.send({'data': data});
});

app.get('/osvjezi', async (req, res) => {
  if (req.oidc.isAuthenticated()) {
  try {
    query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
    FROM (
      SELECT *, 
          (
          SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                  FROM (
                      SELECT driverNum, driverName, driverLast, nationality
                      FROM drivers NATURAL JOIN driverInTeam
                      WHERE teams.id = driverInTeam.id AND 
                        teams.id IN (SELECT id FROM teams)
              ) AS driver_data
          ) AS drivers
      FROM teams) result)`
    json_data = await getQuery(query);

    query = `(SELECT JSON_AGG(ROW_TO_JSON(result)) FROM (SELECT *
      FROM teams NATURAL JOIN driverInTeam NATURAL JOIN drivers ) result)`
    csv_data = await getQuery(query);
    var str = '';
    var i = 0;
    Object.keys(csv_data[0]).forEach(el => {
      str += el;
      i++;
      if (i < Object.keys(csv_data[0]).length) str += ';';
    })
    str += '\r\n';

    csv_data.forEach(row => {
      var i = 0;
      Object.keys(csv_data[0]).forEach(el => {
        str += row[el];
        i++;
        if (i < Object.keys(csv_data[0]).length) str += ';';
      })
      str += "\r\n";
    });    

    fs.writeFile('or.json', JSON.stringify(json_data), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Data has been written to the file successfully!');
      }
    });

    console.log(str);
    fs.writeFile('or.csv', str, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Data has been written to the file successfully!');
      }
    });

    res.render('index', {auth : req.oidc.isAuthenticated()});
  } catch (error) {
    res.status(500).json({ error: error});
  }
  } else {
    res.send('Niste prijavljeni');
  }
});

app.get('/filejson', async(req, res) => {
  fs.readFile('or.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.send(err);
    } else {
      console.log('File content:', data);
      res.send({'data' : data});
    }
  });
});

app.get('/filecsv', async(req, res) => {
  fs.readFile('or.csv', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.send(err);
    } else {
      console.log('File content:', data);
      res.send({'data' : data});
    }
  });
});

app.use((req, res, next) => {
  res.status(501).json({ status: 'Error', message: 'Path not defined', response: null});
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});