const express = require('express');
const PlayersController = require('../controllers/players.controller');

const router = express.Router();

/**
 *  @swagger
 *  /api/player/search/{gamertag}:
 *    get:
 *      tags: [ "PlayersController" ]
 *      description: Search Players
 *      parameters:
 *        - name: gamertag
 *          description: Players gamertag
 *          in: path
 *          schema:
 *            type: string
 *          required: true
 *        - name: platform
 *          description: Platform to search
 *          in: query
 *          schema:
 *            type: string
 *          enum: ["xbl", "psn", "battle", "all"]
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/player/search/:gamertag')
  .get(PlayersController.searchPlayers);

/**
 *  @swagger
 *  /api/player:
 *    post:
 *      tags: [ "PlayersController" ]
 *      security:
 *        - ApiKeyAuth: []
 *      description: Create a player
 *      requestBody:
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: Players name
 *                gamertag:
 *                  type: string
 *                  description: Players gamertag
 *                platform:
 *                 type: string
 *                 description: Players platform
 *              required:
 *                - name
 *                - gamertag
 *                - platform
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/player')
  .post(PlayersController.addPlayer);

/**
 *  @swagger
 *  /api/player/fetchStats/{gamertag}:
 *    put:
 *      tags: [ "PlayersController" ]
 *      description: Fetch a players stats
 *      parameters:
 *        - name: gamertag
 *          description: Players gamertag
 *          in: path
 *          schema:
 *            type: string
 *          required: true
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/player/fetchStats/:gamertag')
  .put(PlayersController.fetchPlayerStats);

/**
 *  @swagger
 *  /api/players:
 *    get:
 *      tags: [ "PlayersController" ]
 *      description: Get all players
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/players')
  .get(PlayersController.getPlayers);

/**
 *  @swagger
 *  /api/players/fetchLatestStatsMatches:
 *    post:
 *      tags: [ "PlayersController" ]
 *      description: Fetch stats/matches for all users
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/players/fetchLatestStatsMatches')
  .post(PlayersController.fetchLatestStatsMatches);

/**
 *  @swagger
 *  /api/player/stats/lifetime:
 *    get:
 *      tags: [ "PlayersController" ]
 *      description: Get lifetime stats for all players
 *      parameters:
 *        - name: page
 *          description: The page
 *          in: query
 *          schema:
 *            type: integer
 *            minimum: 1
 *        - name: pageSize
 *          description: Page size
 *          in: query
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *        - name: players
 *          description: Array of players you to include
 *          in: query
 *          schema:
 *            type: string
 *        - name: modeType
 *          description: The mode type you want to filter
 *          in: query
 *          schema:
 *            type: string
 *            enum:
 *              - all
 *              - br
 *              - plunder
 *        - name: sortColumn
 *          description: What column to sort on
 *          in: query
 *          schema:
 *            type: string
 *        - name: sortDir
 *          description: Which direction to sort
 *          in: query
 *          schema:
 *            type: string
 *            enum:
 *              - asc
 *              - desc
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/player/stats/lifetime')
  .get(PlayersController.getLifetimeStats);

/**
 *  @swagger
 *  /api/player/stats/recent:
 *    get:
 *      tags: [ "PlayersController" ]
 *      description: Get recent match stats
 *      parameters:
 *        - name: page
 *          description: The page
 *          in: query
 *          schema:
 *            type: integer
 *            minimum: 1
 *        - name: pageSize
 *          description: Page size
 *          in: query
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *        - name: players
 *          description: Array of players you to include
 *          in: query
 *          schema:
 *            type: string
 *        - name: modeType
 *          description: The mode type you want to filter
 *          in: query
 *          schema:
 *            type: string
 *            enum:
 *              - all
 *              - br
 *              - plunder
 *        - name: sortColumn
 *          description: What column to sort on
 *          in: query
 *          schema:
 *            type: string
 *        - name: sortDir
 *          description: Which direction to sort
 *          in: query
 *          schema:
 *            type: string
 *            enum:
 *              - asc
 *              - desc
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/player/stats/recent')
  .get(PlayersController.getRecentStats);

module.exports = router;
