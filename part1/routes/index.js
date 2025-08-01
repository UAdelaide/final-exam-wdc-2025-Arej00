var express = require('express');
var router = express.Router();
var db=require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/dogs', async (req, res) => {
  try{
    const [rows] = await db.query(`
    SELECT d.name AS dog_name,d.size,u.username AS owner_username
    FROM Dogs d
    JOIN Users u ON d.owner_id=u.user_id
  `);
  res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs',details: err.message});
  }
});

router.get('/api/walkrequests/open', async (req, res) => {
  try{
    const [rows] = await db.query(`
    SELECT wr.request_id,d.name AS dog_name,wr.requested_time,
    wr.duration_minutes,wr.location,u.username AS owner_username
    FROM WalkRequests wr
    JOIN Dogs d ON wr.dog_id=d.dog_id
    JOIN Users u ON d.owner_id=u.user_id
    WHERE wr.status='open'
  `);
  res.json(rows);
  }catch (err) {
    res.status(500).json({ error: 'Failed to fetch open walks details',details: err.message});
  }

});

router.get('/api/walkers/summary', async (req, res) => {
  try{
    const [rows] = await db.query(`
    SELECT u.username AS walker_username,
      COUNT(wr.rating_id) AS total_ratings,
      ROUND(AVG(wr.rating),2) AS average_rating,
      COUNT(wr.request_id) AS completed_walks
    FROM Users u
    LEFT JOIN WalkRatings wr ON u.user_id=wr.walker_id
    WHERE u.role='walker'
    GROUP BY u.username
   `);
   res.json(rows);
  }catch (err) {
    res.status(500).json({ error: 'Failed to fetch walker summary',details: err.message});
  }
});

module.exports = router;
