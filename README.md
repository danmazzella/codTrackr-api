# codTrackr-api

This API was built to support a website for Warzone so that our friends can compare their stats/best matches with each other.

Requirements:<br>
MongoDB - For storing the data<br>
Redis - For the queueing system

On first run it will create a config/config.environment.js file. You will need to update that file with all the data required before the API will successfully start.

It uses the Call of Duty API to retrieve match information for players that are added into the DB. It'll get the most recent games for every player in the DB every hour.
