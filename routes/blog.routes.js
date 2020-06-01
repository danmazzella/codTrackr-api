const express = require('express');
const BlogController = require('../controllers/blog.controller');

const router = express.Router();

/**
 *  @swagger
 *  /api/blog/post:
 *    post:
 *      tags: [ "BlogController" ]
 *      security:
 *        - ApiKeyAuth: []
 *      description: Create a blog post
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
 *                image:
 *                  type: string
 *                  description: URL for image
 *                content:
 *                  type: string
 *                  description: Blog content
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
router.route('/blog/post')
  .post(BlogController.createPost);

/**
 *  @swagger
 *  /api/blog/posts:
 *    get:
 *      tags: [ "BlogController" ]
 *      description: Get blog posts
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
router.route('/blog/posts')
  .get(BlogController.getPosts);

module.exports = router;
