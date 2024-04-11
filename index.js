const express = require('express');
const app = express();
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', require('./routes/noti_routes'));
app.listen(3001, function () {
  console.log('App listen on port 3001 ');
});
