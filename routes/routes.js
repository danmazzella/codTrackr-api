const BlogRoutes = require('./blog.routes');
const CommunityPostsRoutes = require('./communityPosts.routes');
const MatchesRoutes = require('./matches.routes');
const PlayersRoutes = require('./players.routes');
const ScriptRoutes = require('./script.routes');

// Initialize all the different route files
module.exports = function (app) {
  app.use('/api/', [
    BlogRoutes,
    CommunityPostsRoutes,
    MatchesRoutes,
    PlayersRoutes,
    ScriptRoutes,
  ]);
};
