const express = require('express');
const CommunityPostsController = require('../controllers/communityPosts.controller');

const router = express.Router();

/**
 *  @swagger
 *  /api/communityPosts/post:
 *    post:
 *      tags: [ "CommunityPostsController" ]
 *      summary: Create a communityPosts post
 *      requestBody:
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  description: Post title
 *                author:
 *                  type: string
 *                  description: Author of the post
 *                content:
 *                  type: string
 *                  description: CommunityPosts content
 *              required:
 *                - title
 *                - author
 *                - content
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/communityPosts/post')
  .post(CommunityPostsController.createPost);

/**
 *  @swagger
 *  /api/communityPosts/posts:
 *    get:
 *      tags: [ "CommunityPostsController" ]
 *      summary: Get communityPosts posts
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
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/communityPosts/posts')
  .get(CommunityPostsController.getPosts);

/**
 *  @swagger
 *  /api/communityPosts/post/{postId}/approve:
 *    get:
 *      tags: [ "CommunityPostsController" ]
 *      summary: Approve a community post
 *      parameters:
 *        - name: postId
 *          description: ID of the post
 *          in: path
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Server is up and running
 *        default:
 *          description: Something is wrong
 */
router.route('/communityPosts/post/:postId/approve')
  .get(CommunityPostsController.approvePost);

module.exports = router;
