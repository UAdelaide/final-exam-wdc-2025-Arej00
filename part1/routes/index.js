var express = require('express');
var router = express.Router();
var db=require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/dogs', async (req, res) => {
  const [rows] = await db.query(`
    SELECT d.name AS dog_name,d.size,u.username AS owner_username
    FROM Dogs d
    JOIN Users u ON d.owner_id=u.user_id
  `);
  res.json(rows);
});

router.get('/api/walkrequests/open', async (req, res) => {
  const [rows] = await db.query(`
    SELECT wr.request_id,d.name AS dog_name,wr.requested_time,
    wr.duration_minutes,wr.location,u.username AS owner_username
    FROM WalkRequests wr
    JOIN Dogs d ON wr.dog_id=d.dog_id
    JOIN Users u ON d.owner_id=u.user_id
    WHERE wr.status='open'
  `);
  res.json(rows);
});

router.get('/api/walkers/summary', async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.username AS walker_username,
    COUNT(r.rating_id) AS total_ratings,
    ROUND(AVG(r.rating),2) AS average_rating,
    COUNT(DISTINCT wr_completed.request_id) AS completed_walks
    FROM Users u
    LEFT JOIN WalkRatings r ON u.user_id=r.walker_id
    LEFT JOIN WalkRequests wr_completed
    ON r.request_id=wr_completed.request_id AND wr_completed_status='completed'
    WHERE 
  `);
  res.json(rows);
});

module.exports = router;
