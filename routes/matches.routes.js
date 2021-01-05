const express = require('express');
const MatchesController = require('../controllers/matches.controller');

const router = express.Router();

/**
 *  @swagger
 *  /api/matches:
 *    get:
 *      tags: [ "MatchesController" ]
 *      summary: Get all matches
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
 *              - solos
 *              - threes
 *        - name: topTen
 *          description: Filter for only top 10 results
 *          in: query
 *          schema:
 *            type: boolean
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/matches')
  .get(MatchesController.getMatches);

/**
 *  @swagger
 *  /api/match/{matchId}:
 *    get:
 *      tags: [ "MatchesController" ]
 *      summary: Get single match
 *      parameters:
 *        - name: matchId
 *          description: MatchId of desired match
 *          in: path
 *          schema:
 *            type: string
 *          required: true
 *        - name: gamertag
 *          description: The gamertag of the player
 *          in: query
 *          schema:
 *            type: string
 *          required: true
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/match/:matchId')
  .get(MatchesController.getMatch);


/**
 *  @swagger
 *  /api/matches/fetchLatest/{gamertag}:
 *    put:
 *      tags: [ "MatchesController" ]
 *      summary: Fetch latest matches for a player
 *      parameters:
 *        - name: gamertag
 *          description: The desired gamertag
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
router.route('/matches/fetchLatest/:gamertag')
  .put(MatchesController.fetchMatchesForUser);

/**
 *  @swagger
 *  /api/matches/topFive:
 *    get:
 *      tags: [ "MatchesController" ]
 *      summary: Get top five matches for players
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
 *        - name: monthFilter
 *          description: Month wish to get results for
 *          in: query
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/matches/topFive')
  .get(MatchesController.getTopFiveGames);

/**
 *  @swagger
 *  /api/matches/{matchId}:
 *    get:
 *      tags: [ "MatchesController" ]
 *      summary: Get a match data
 *      parameters:
 *        - name: matchId
 *          description: Match data
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/matches/:matchId')
  .get(MatchesController.getMatchData);

module.exports = router;
