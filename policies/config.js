const Policies = require('./index');

module.exports = {
  blog: {
    '*': [Policies.all],
    createPost: [Policies.isAdmin],
  },
  communityPosts: {
    '*': [Policies.all],
  },
  matches: {
    '*': [Policies.all],
  },
  players: {
    '*': [Policies.all],
    addPlayer: [Policies.isAdmin],
  },
  script: {
    '*': [Policies.all],
    fetchAllMatchesForUser: [Policies.isAdmin],
  },
};
