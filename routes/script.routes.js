const express = require('express');
const ScriptsController = require('../controllers/script.controller');

const router = express.Router();

/**
 *  @swagger
 *  /api/scripts/moveRankedTeamsToMatchTeams:
 *    post:
 *      tags: [ "ScriptsController" ]
 *      description: Move rankedTeams from matches to matchTeams
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/scripts/moveRankedTeamsToMatchTeams')
  .post(ScriptsController.moveRankedTeamsToMatchTeams);

/**
 *  @swagger
 *  /api/scripts/updateOcaScore:
 *    post:
 *      tags: [ "ScriptsController" ]
 *      description: Update oCa Score for all matches
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/scripts/updateOcaScore')
  .post(ScriptsController.recalculateOcaScores);

/**
 *  @swagger
 *  /api/scripts/fetchAllUsersMatches:
 *    post:
 *      tags: [ "ScriptsController" ]
 *      security:
 *        - ApiKeyAuth: []
 *      description: Fetch all lifetime matches for a user
 *      parameters:
 *        - name: gamertag
 *          description: The desired gamertag
 *          in: query
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/scripts/fetchAllUsersMatches')
  .post(ScriptsController.fetchAllMatchesForUser);

module.exports = router;
