const Logger = require('./winston');
const Validator = require('./validator');

const CommonHelpers = {
  // Convert match into the Mongo match object
  createMatchObj: (userName, match) => {
    try {
      const stats = match.playerStats;

      let matchType = 'Unknown';
      if (match.mode === 'br_25') {
        matchType = 'Battle Royal Threes';
      } else if (match.mode === 'br_87') {
        matchType = 'Battle Royal Solos';
      } else if (match.mode === 'br_dmz_104') {
        matchType = 'Plunder Threes';
      } else if (match.mode === 'br_dmz_76' || match.mode === 'br_dmz.38') {
        matchType = 'Plunder Quads';
      } else if (match.mode === 'br_dmz_85') {
        matchType = 'Plunder Duos';
      } else if (match.mode === 'br_71') {
        matchType = 'Stimulus Solos';
      } else if (match.mode === 'br_89') {
        matchType = 'Battle Royal Quads';
      } else if (match.mode === 'br_88') {
        matchType = 'Battle Royal Duos';
      } else if (match.mode === 'br_77') {
        matchType = 'Scopes And Scatterguns';
      } else if (!Validator.isNullOrUndefined(match.mode)) {
        matchType = match.mode;
      }

      const matchObj = {
        matchId: match.matchID,
        playerName: userName,
        modeType: matchType,
        matchDuration: match.duration,
        matchTime: match.utcStartSeconds * 1000,
        playerCount: match.playerCount,
        mapName: 'Verdansk',
        placement: stats.teamPlacement,
        stats: {
          kills: stats.kills,
          score: stats.score,
          timePlayedSeconds: stats.timePlayed,
          headshots: stats.headshots,
          executions: stats.executions,
          assists: stats.assists,
          percentTimeMoving: stats.percentTimeMoving,
          scorePerMinute: stats.scorePerMinute,
          damageDone: stats.damageDone,
          distanceTraveled: stats.distanceTraveled,
          deaths: stats.deaths,
          damageTaken: stats.damageTaken,
          teamSurvivalTime: stats.teamSurvivalTime,
          gulagDeaths: stats.gulagDeaths,
          gulagKills: stats.gulagKills,
          cachesOpened: stats.objectiveBrCacheOpen !== undefined ? stats.objectiveBrCacheOpen : 0,
          teamsWiped: stats.objectiveTeamWiped !== undefined ? stats.objectiveTeamWiped : 0,
          lastStandKills: stats.objectiveLastStandKill !== undefined ? stats.objectiveLastStandKill : 0,
          revives: stats.objectiveReviver !== undefined ? stats.objectiveReviver : 0,
          kioskBuys: stats.objectiveBrKioskBuy !== undefined ? stats.objectiveBrKioskBuy : 0,
          downsInCircleOne: stats.objectiveBrDownEnemyCircle1 !== undefined ? stats.objectiveBrDownEnemyCircle1 : 0,
          downsInCircleTwo: stats.objectiveBrDownEnemyCircle2 !== undefined ? stats.objectiveBrDownEnemyCircle2 : 0,
          downsInCircleThree: stats.objectiveBrDownEnemyCircle3 !== undefined ? stats.objectiveBrDownEnemyCircle3 : 0,
          downsInCircleFour: stats.objectiveBrDownEnemyCircle4 !== undefined ? stats.objectiveBrDownEnemyCircle4 : 0,
          downsInCircleFive: stats.objectiveBrDownEnemyCircle5 !== undefined ? stats.objectiveBrDownEnemyCircle5 : 0,
          downsInCircleSix: stats.objectiveBrDownEnemyCircle6 !== undefined ? stats.objectiveBrDownEnemyCircle6 : 0,
        },
      };

      const numMinutes = (matchObj.matchDuration / 1000) / 60;
      const damagePerMinute = matchObj.stats.damageDone / numMinutes;
      matchObj.stats.dataPerMinute = damagePerMinute;

      const playerObj = match.player;
      let playerName = playerObj.username;
      if (!Validator.isNullOrUndefined(playerObj.clantag)) {
        playerName = `[${playerObj.clantag}]${playerObj.username}`;
      }

      // Get placement from the ranked teams
      const rankedTeamIndex = match.rankedTeams.findIndex((rankedTeam) => {
        if (Validator.isNullOrUndefined(rankedTeam.players)) {
          return false;
        }

        const playerIndex = rankedTeam.players.findIndex((player) => {
          let matchPlayerName = player.username;
          if (!Validator.isNullOrUndefined(player.clantag)) {
            matchPlayerName = `[${player.clantag}]${player.username}`;
          }
          return player.username === playerName || matchPlayerName === playerName;
        });
        if (playerIndex > -1) {
          return true;
        }
        return false;
      });

      if (rankedTeamIndex > -1 && !Validator.isNullOrUndefined(match.rankedTeams[rankedTeamIndex])) {
        if (!Validator.isNullOrUndefined(match.rankedTeams[rankedTeamIndex].players)) {
          matchObj.players = match.rankedTeams[rankedTeamIndex].players.map(player => player.username);
        }
        matchObj.placement = rankedTeamIndex + 1;
      }

      matchObj.stats.ocaScore = CommonHelpers.calculateOcaScore(matchObj);

      return matchObj;
    } catch (error) {
      Logger.error('Error createMatchObj: ', error);
      return { success: false };
    }
  },
  // Convert the recent match stats into the Mongo stats object
  createRecentMatchStatsObj: (playerName, statsObj) => {
    let matchType = 'Unknown';
    if (statsObj.key === 'all') {
      matchType = 'All';
    } else if (statsObj.key === 'br_25') {
      matchType = 'Battle Royal Threes';
    } else if (statsObj.key === 'br_87') {
      matchType = 'Battle Royal Solos';
    } else if (statsObj.key === 'br_dmz_104') {
      matchType = 'Plunder Threes';
    } else if (statsObj.key === 'br_dmz_76' || statsObj.key === 'br_dmz.38') {
      matchType = 'Plunder Quads';
    } else if (statsObj.key === 'br_dmz_85') {
      matchType = 'Plunder Duos';
    } else if (statsObj.key === 'br_71') {
      matchType = 'Stimulus Solos';
    } else if (statsObj.key === 'br_89') {
      matchType = 'Battle Royal Quads';
    } else if (statsObj.key === 'br_88') {
      matchType = 'Battle Royal Duos';
    } else if (statsObj.key === 'br_77') {
      matchType = 'Scopes And Scatterguns';
    } else if (!Validator.isNullOrUndefined(statsObj.key)) {
      matchType = statsObj.key;
    }

    const returnStatsObj = {
      gamertag: playerName,
      modeType: matchType,
      kills: statsObj.kills,
      teamsWiped: statsObj.objectiveTeamWiped !== undefined ? statsObj.objectiveTeamWiped : 0,
      lastStandKills: statsObj.objectiveLastStandKill !== undefined ? statsObj.objectiveLastStandKill : 0,
      avgLifeTime: statsObj.avgLifeTime,
      plunderCashBloodMoney: statsObj.objectivePlunderCashBloodMoney !== undefined ? statsObj.objectivePlunderCashBloodMoney : 0,
      score: statsObj.score,
      headshots: statsObj.headshots,
      assists: statsObj.assists,
      killsPerGame: statsObj.killsPerGame,
      scorePerMinute: statsObj.scorePerMinute,
      distanceTraveled: statsObj.distanceTraveled,
      deaths: statsObj.deaths,
      lootChopperBoxOpen: statsObj.objectiveBrLootChopperBoxOpen !== undefined ? statsObj.objectiveBrLootChopperBoxOpen : 0,
      destroyedEquipment: statsObj.objectiveDestroyedEquipment !== undefined ? statsObj.objectiveDestroyedEquipment : 0,
      kdRatio: statsObj.kdRatio,
      missionPickupTablet: statsObj.objectiveBrMissionPickupTablet !== undefined ? statsObj.objectiveBrMissionPickupTablet : 0,
      revives: statsObj.objectiveReviver !== undefined ? statsObj.objectiveReviver : 0,
      kioskBuys: statsObj.objectiveBrKioskBuy !== undefined ? statsObj.objectiveBrKioskBuy : 0,
      gulagKills: statsObj.gulagKills,
      gulagDeaths: statsObj.gulagDeaths,
      timePlayed: statsObj.timePlayed,
      headshotPercent: statsObj.headshotPercentage,
      executions: statsObj.executions,
      matchesPlayed: statsObj.matchesPlayed,
      cachesOpened: statsObj.objectiveBrCacheOpen !== undefined ? statsObj.objectiveBrCacheOpen : 0,
      damageDone: statsObj.damageDone,
      damageTaken: statsObj.damageTaken,
      downsInCircleOne: statsObj.objectiveBrDownEnemyCircle1 !== undefined ? statsObj.objectiveBrDownEnemyCircle1 : 0,
      downsInCircleTwo: statsObj.objectiveBrDownEnemyCircle2 !== undefined ? statsObj.objectiveBrDownEnemyCircle2 : 0,
      downsInCircleThree: statsObj.objectiveBrDownEnemyCircle3 !== undefined ? statsObj.objectiveBrDownEnemyCircle3 : 0,
      downsInCircleFour: statsObj.objectiveBrDownEnemyCircle4 !== undefined ? statsObj.objectiveBrDownEnemyCircle4 : 0,
      downsInCircleFive: statsObj.objectiveBrDownEnemyCircle5 !== undefined ? statsObj.objectiveBrDownEnemyCircle5 : 0,
      downsInCircleSix: statsObj.objectiveBrDownEnemyCircle6 !== undefined ? statsObj.objectiveBrDownEnemyCircle6 : 0,
    };

    const numMinutes = statsObj.timePlayed / 60;
    const damagePerMinute = statsObj.damageDone / numMinutes;
    returnStatsObj.dataPerMinute = damagePerMinute;

    return returnStatsObj;
  },
  // Convert the players stats into the Mongo stats object
  createPlayersStatsObj: (playerName, statsObj) => {
    let matchType = 'Unknown';
    if (statsObj.key === 'br_all') {
      matchType = 'All';
    } else if (statsObj.key === 'br') {
      matchType = 'Battle Royal';
    } else if (statsObj.key === 'br_dmz') {
      matchType = 'Plunder';
    }

    const { properties } = statsObj;

    const returnStatsObj = {
      gamertag: playerName,
      modeType: matchType,
      wins: properties.wins,
      kills: properties.kills,
      kdRatio: properties.kdRatio,
      downs: properties.downs,
      topTwentyFive: properties.topTwentyFive,
      topTen: properties.topTen,
      contracts: properties.contracts,
      revives: properties.revives,
      topFive: properties.topFive,
      score: properties.score,
      timePlayed: properties.timePlayed,
      gamesPlayed: properties.gamesPlayed,
      scorePerMinute: properties.scorePerMinute,
      cash: properties.cash,
      deaths: properties.deaths,
    };

    return returnStatsObj;
  },
  // Calculate the ocaScore from the match object
  calculateOcaScore: (matchObj) => {
    let ocaScore = 0;

    const {
      modeType,
      placement,
    } = matchObj;

    const {
      cachesOpened,
      damageDone,
      downsInCircleOne,
      downsInCircleTwo,
      downsInCircleThree,
      downsInCircleFour,
      downsInCircleFive,
      downsInCircleSix,
      kills,
    } = matchObj.stats;

    if (modeType === 'Battle Royal Threes' || modeType === 'Battle Royal Quads') {
      if (placement === 1) {
        ocaScore += 50;
      } else if (placement === 2) {
        ocaScore += 40;
      } else if (placement === 3) {
        ocaScore += 35;
      } else if (placement <= 5) {
        ocaScore += 30;
      } else if (placement <= 10) {
        ocaScore += 20;
      } else if (placement <= 15) {
        ocaScore += 10;
      } else if (placement <= 20) {
        ocaScore += 5;
      }
    } else if (modeType === 'Battle Royal Solos' || modeType === 'Battle Royal Duos') {
      if (placement === 1) {
        ocaScore += 50;
      } else if (placement === 2 || placement === 3) {
        ocaScore += 40;
      } else if (placement === 4 || placement === 5) {
        ocaScore += 35;
      } else if (placement <= 10) {
        ocaScore += 30;
      } else if (placement <= 20) {
        ocaScore += 20;
      } else if (placement <= 50) {
        ocaScore += 10;
      } else if (placement <= 100) {
        ocaScore += 5;
      }
    } else {
      return null;
    }

    if (kills > 0) {
      ocaScore += (kills * 5);
    }

    if (damageDone > 0) {
      ocaScore += (damageDone / 100);
    }

    if (cachesOpened > 0) {
      ocaScore += (cachesOpened * 0.20);
    }

    let totalDowns = 0;
    totalDowns += downsInCircleOne;
    totalDowns += downsInCircleTwo;
    totalDowns += downsInCircleThree;
    totalDowns += downsInCircleFour;
    totalDowns += downsInCircleFive;
    totalDowns += downsInCircleSix;

    const finalDowns = totalDowns - kills;
    if (finalDowns > 0) {
      ocaScore += (finalDowns * 2);
    }

    ocaScore = parseFloat(ocaScore.toFixed(2));

    return ocaScore;
  },
};

module.exports = CommonHelpers;
