# codTrackr-api

##### This API was built to support a website for Warzone so that our friends can compare their stats/best matches with each other.

###### Requirements:
  - MongoDB:For storing the data
  - Redis: For the queueing system

###### On first run it will create a config/config.environment.js file. You will need to update that file with all the data required before the API will successfully start. It uses the Call of Duty API to retrieve match information for players that are added into the DB. It'll get the most recent games for every player in the DB every hour.

### Installation Instructions for MacOS:
###### Install HomeBrew from their website
```https://brew.sh/```

###### Install and Start MongoDB
```
brew tap mongodb/brew
brew install mongodb-community@4.2
brew services start mongodb-community@4.2
```

###### Install and Start Redis
```
brew install redis
brew services start redis
```

###### Install NodeJS
```
brew install node@12
```

###### Create Mongo User
```
mongo
use codapi
db.createUser({
    "user" : "codapiuser",
    "pwd": "codapipassword",
    "roles" : [
        {
            "role" : "userAdmin",
            "db" : "codapi"
        }
    ]
})
```

###### Clone codTrackr-api
```
git clone git@github.com:danmazzella/codTrackr-api.git
cd codTrackr-api
npm install
```

###### Start codTrackr-api to create Config file
```
node index.js
```

This will create a config/config.environment.js file. Inside the file you need to update all your parameters:
  - mongo.url: This is your URL to access the mongo DB. You will use the same user/pwd as set in the `db.createUser()` command
  - redis
    - url: This is the IP address that the Redis server is running on. Most likely 127.0.0.1 if your local machine
    - port: Default redis port is 6379
  - dev.url: This is the URL the API is running on for dev. Most likely http://127.0.0.1:8081
  - prod.url: This is the URL the production API is running on. This can be your domain name, or your external IP address
    - ex: http://codapi.example.com
  - email: The email is used for creating a "community post". Currently there is no user authentication, so any user can create a "community post". So when a user creates a post the email here will receive an email with the post contents and a URL that will allow you to approve the post.
    - email.username: This is just the username to log into your Gmail
    - email.password: The password for the Gmail account
    - email.fromAddress: This is the email sending the message
      - 'Dan COD <dancod@gmail.com>'
    - email.toAddress: This is where you want the email sent to
      - 'Dan Recipient '<danrecipient@gmail.com>'
  - callOfDuty: This is your my.callofduty.com account that will be used for making the API calls
    - email: Your email/login username
    - password: Your account password
  - admin.apiKey: This is your 'private' API key again since we don't have authentication yet. There are currently 3 API that requires this API Key and expects the key to be passed through the request headers.

###### After updating the Config file start the API again
```
node index.js
```

###### Access the API Swagger docs
```
http://<your-API-url>/api-docs
```
Ex: `http://localhost:8081/api-docs`

###### Authorize with Swagger API
![Authorize](https://i.ibb.co/K2mrsdw/authorize.png)

###### Add a player to your database
![AddPlayer](https://i.ibb.co/Z2TJGGT/addplayer.png)
