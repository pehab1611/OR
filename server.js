const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('scrips'));
app.use(bodyParser.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'OR_Labos',
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
                    WHERE teams.teamName = driverInTeam.teamName AND 
                      teams.teamName IN (SELECT teamName FROM teams)
            ) AS driver_data
        ) AS drivers
    FROM teams) result)`;
  data = await getQuery(query);
  if(data) {
    res.status(200).json({ status: 'OK', message: 'List of all data', response : data});
  } else {
    res.status(404).json({ status: 'Empty database', message: 'Empty data base', response : data});
  }
});

app.get('/api/v1/data/:id', async(req, res) => {
  const id = req.params.id.replaceAll('_', ' ');
  console.log(id);
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(result))
  FROM (
    SELECT *, 
        (
        SELECT JSON_AGG(ROW_TO_JSON(driver_data))
                FROM (
                    SELECT driverNum, driverName, driverLast, nationality
                    FROM drivers NATURAL JOIN driverInTeam
                    WHERE teams.teamName = driverInTeam.teamName AND 
                      teams.teamName IN (SELECT teamName FROM teams)
            ) AS driver_data
        ) AS drivers
    FROM teams WHERE teams.teamName = '` + id + `') result)`;
  data = await getQuery(query);
  if (!data) {
    res.status(404).json({ status: 'Error', message: 'Wrong id', response : null});
  } else {
    res.status(200).json({ status: 'OK', message: 'Data for team ' + id, response : data[0]});
  }
});

app.get('/api/v1/team/:id', async(req, res) => {
  //samo tim po id-u
  const id = req.params.id.replaceAll('_', ' ');
  console.log(id);
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(teams))
    FROM teams WHERE teams.teamName = '` + id + `')`;
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
  console.log(id);
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(drivers))
    FROM drivers WHERE drivers.driverNum = '` + id + `')`;
  try {
    data = await getQuery(query);
    if(data) {
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
  const id = req.params.id.replaceAll('_', ' ');
  console.log(id);
  var query = `(SELECT JSON_AGG(ROW_TO_JSON(drivers))
    FROM drivers NATURAL JOIN driverInTeam NATURAL JOIN teams WHERE teams.teamName = '` + id + `')`;
  try {
    data = await getQuery(query);
    if(data) {
      res.status(200).json({ status: 'OK', message: 'Data for team ' + id + ' drivers', response : data});
    } else {
      res.status(404).json({ status: 'Error', message: 'Wrong id', response : null});
    }
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response : null});
  }
});

app.post('/api/v1/add/team', async (req, res) => {
  const { teamName, teamBase, teamChief, chassis, powerUnit, firstEntry, teamChampionships, driverChampionships, highestRaceFinish, polePositions, fastestLaps, points, drivers } = req.body;
  if (teamName && teamBase && teamChief && chassis && powerUnit && firstEntry && teamChampionships && driverChampionships && highestRaceFinish && polePositions && fastestLaps && points && drivers && !isNaN(firstEntry) && !isNaN(teamChampionships) && !isNaN(driverChampionships) && !isNaN(highestRaceFinish) && !isNaN(polePositions) && !isNaN(fastestLaps) && !isNaN(points)) {
    try {
      var query = `(SELECT * FROM teams WHERE teamName = '` + teamName + `')`;
      const t = await pool.query(query);
      if(t.rows.length > 0) {
        res.status(404).json({status: 'Already exists', message: 'Team with name ' + teamName + ' already exists', response: null});
        return; 
      }
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
      query = `INSERT INTO teams(teamName, teamBase, teamChief, chassis, powerUnit, firstEntry, teamChampionships, driverChampionships, highestRaceFinish, polePosition, fastestLaps, points) VALUES ('${teamName}', '${teamBase}', '${teamChief}', '${chassis}', '${powerUnit}', '${firstEntry}', '${teamChampionships}', '${driverChampionships}', '${highestRaceFinish}', '${polePositions}', '${fastestLaps}', '${points}')`;
      const data = await pool.query(query);
      drivers.forEach(async driver => {
        const insDriver = `INSERT INTO drivers(driverName, driverLast, driverNum, nationality) VALUES ('${driver.driverName}', '${driver.driverLast}', '${driver.driverNum}', '${driver.nationality}')`;
        const data1 = await pool.query(insDriver);
        const insDiT =  `INSERT INTO driverInTeam(teamName, driverNum) VALUES ('${teamName}', '${driver.driverNum}')`
        const data2 = await pool.query(insDiT);
      });
      res.status(200).json({ status: 'Success', message: 'Team added successfully', response: null });
    } catch (err) {
      res.status(404).json({ status: 'Error', message: err.message, response: null });
    }
  } else {
    res.status(404).json({ status: 'Error', message: 'Invalid data provided', response: null });
  }
});

app.put('/api/v1/edit/team/:id', async (req, res) => {
  const teamName = req.params.id.replaceAll('_', ' ');
  console.log(teamName);
  const { teamBase, teamChief, chassis, powerUnit, firstEntry, teamChampionships, driverChampionships, highestRaceFinish, polePositions, fastestLaps, points, drivers } = req.body;
  var doIt = true;
  try {
    if((firstEntry && isNaN(firstEntry)) || (teamChampionships && isNaN(teamChampionships)) || (driverChampionships && isNaN(driverChampionships)) || (highestRaceFinish && isNaN(highestRaceFinish)) || (polePositions && isNaN(polePositions)) || (fastestLaps && isNaN(fastestLaps)) || (points && isNaN(points))) {
      doIt = false;
      throw new Error(`Invalid data type`);
    } 
    var query = `(SELECT * FROM teams WHERE teamName = '` + teamName + `')`;
    const t = await pool.query(query);
    if(t.rows.length == 0) {
      res.status(404).json({status: 'Does not exist', message: 'Team with name ' + teamName + ' does not exist', response: null});
      return;
    }
    if(chassis && chassis.length > 10) {
      doIt = false;
      throw new Error(`Chassis can have maximum of 10 characters`);
    }
    if(drivers && doIt){
      const driverPromises = drivers.map(async (driver) => {
        const driverQuery = `SELECT * FROM drivers NATURAL JOIN driverInTeam NATURAL JOIN teams WHERE drivers.driverNum = ` + driver.driverNum + ` AND teams.teamName != '` + teamName + `'`;
        const driverCheck = await pool.query(driverQuery);
        if (driverCheck.rows.length > 0) {
          throw new Error(`Driver with number ` + driver.driverNum + ` already exists in another team`);
        }
      });
      await Promise.all(driverPromises);
      const driverNums = await pool.query(`SELECT driverNum FROM driverInTeam WHERE teamName = '` + teamName + `'`);
      console.log('driverNums: ', driverNums.rows);
      const driverPromises1 = driverNums.rows.map(async (driver) => {
        console.log(driver.drivernum)
        const driverQuery = `DELETE FROM driverInTeam WHERE driverNum = ` + driver.drivernum;
        const driverCheck = await pool.query(driverQuery);
        const driverQuery1 = `DELETE FROM drivers WHERE driverNum = ` + driver.drivernum;
        const driverCheck1 = await pool.query(driverQuery1);
      });
      await Promise.all(driverPromises1);
      if(teamBase) {
        const q = `UPDATE teams SET teamBase = '${teamBase}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(teamChief) {
        const q = `UPDATE teams SET teamChief = '${teamChief}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(chassis) {
        const q = `UPDATE teams SET chassis = '${chassis}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(powerUnit) {
        const q = `UPDATE teams SET powerUnit = '${powerUnit}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(firstEntry) {
        const q = `UPDATE teams SET firstEntry = '${firstEntry}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(teamChampionships) {
        const q = `UPDATE teams SET teamChampionships = '${teamChampionships}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(driverChampionships) {
        const q = `UPDATE teams SET driverChampionships = '${driverChampionships}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(highestRaceFinish) {
        const q = `UPDATE teams SET highestRaceFinish = '${highestRaceFinish}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(polePositions) {
        const q = `UPDATE teams SET polePosition = '${polePositions}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(fastestLaps) {
        const q = `UPDATE teams SET fastestLaps = '${fastestLaps}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      if(points) {
        const q = `UPDATE teams SET points = '${points}' WHERE teamName = '${teamName}'`;
        const data = await pool.query(q);
      }
      const driverPromises2 = drivers.map(async (driver) => {
        const insDriver = `INSERT INTO drivers(driverName, driverLast, driverNum, nationality) VALUES ('${driver.driverName}', '${driver.driverLast}', '${driver.driverNum}', '${driver.nationality}')`;
        const data1 = await pool.query(insDriver);
        const insDiT =  `INSERT INTO driverInTeam(teamName, driverNum) VALUES ('${teamName}', '${driver.driverNum}')`
        const data2 = await pool.query(insDiT);
      });
      await Promise.all(driverPromises2);
      res.status(200).json({ status: 'Success', message: 'Team edited successfully', response: null });
    }
    console.log(doIt);
  } catch (err) {
    res.status(404).json({ status: 'Error', message: err.message, response: null });
  }
});

app.delete('/api/v1/delete/:id', async (req, res) => {
  const teamName = req.params.id.replaceAll('_', ' ');
  console.log(teamName);
  try {
    const query1 = `SELECT * FROM teams WHERE teamName = '${teamName}'`;
    const data = await pool.query(query1);
    if(data.rows.length == 0) {
      throw new Error(`Team with name ` + teamName + ` does not exist`);
    }
    const query2 = `SELECT * FROM driverInTeam WHERE teamName = '${teamName}'`
    const driverNums = await pool.query(query2);
    const query4 = `DELETE FROM driverInTeam WHERE teamName = '${teamName}'`
    const data2 = await pool.query(query4);
    const query3 = `DELETE FROM teams WHERE teamName = '${teamName}'`;
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


app.use((req, res, next) => {
  res.status(501).json({ status: 'Error', message: 'Path not defined', response: null});
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
