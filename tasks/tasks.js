// NPM Modules
const taskScheduler = require('node-schedule');

// Utils
const Logger = require('../utils/winston');

// Tasks
const fetchUserStatsTask = require('./fetchUserStats.task');

/*
  second (0-59)
  minute (0-59)
  hour (0-23)
  date (1-31)
  month (0-11)
  year
  dayOfWeek (0-6) Starting with Sunday
*/

const recurrenceMinute = '* * * * *'; // eslint-disable-line no-unused-vars
const recurrenceHourly = '0 * * * *';

// Fetch Matches hourly
taskScheduler.scheduleJob(
  recurrenceHourly,
  () => {
    Logger.info('Run fetching matches');
    fetchUserStatsTask();
  },
);
