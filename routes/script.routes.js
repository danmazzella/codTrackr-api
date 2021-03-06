const express = require('express');
const ScriptsController = require('../controllers/script.controller');

const router = express.Router();

/**
 *  @swagger
 *  /api/scripts/updateOcaScore:
 *    post:
 *      tags: [ "ScriptsController" ]
 *      summary: Update oCa Score for all matches
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
 *      summary: Fetch all lifetime matches for a user
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

/**
 *  @swagger
 *  /api/scripts/fetchAllMatches:
 *    post:
 *      tags: [ "ScriptsController" ]
 *      security:
 *        - ApiKeyAuth: []
 *      summary: Fetch all lifetime matches for all users
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/scripts/fetchAllMatches')
  .post(ScriptsController.fetchAllMatches);

module.exports = router;
