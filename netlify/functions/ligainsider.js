const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async () => {
    const response = await axios.get(
      "https://www.ligainsider.de/stats/kickbase/marktwerte/gesamt/"
    );

    const html = response.data;

    const $ = cheerio.load(html);

    const playerNames = [];
    const playerURLs = [];
    const playerTeams = [];
    const playerTeamURLs = [];
    const playerPositions = [];
    const playerMarketvalue = [];
    const playerTotalPoints = [];
    const playerAveragePoints = [];
    const players = [];

        // name column
        $("#DataTable > tbody > tr > td:nth-child(3) > strong > a").each(
          (_idx, el) => {
            const name = $(el).text();
            const URL = $(el).attr("href");
            playerNames.push(name);
            playerURLs.push(URL);
          }
        );

        // team column
        $("#DataTable > tbody > tr > td:nth-child(4) > a").each(
          (_idx, el) => {
            const name = $(el).text();
            const URL = $(el).attr("href");
            playerTeams.push(name);
            playerTeamURLs.push(URL);
          }
        );

        // position column
        $("#DataTable > tbody > tr > td:nth-child(5)").each(
          (_idx, el) => {
            const position = $(el).text();
            playerPositions.push(position);
          }
        );

        // total points column
        $("#DataTable > tbody > tr > td:nth-child(6)").each(
          (_idx, el) => {
            const totalPoints = $(el).text();
            playerTotalPoints.push(totalPoints);
          }
        );

        // average points column
        $("#DataTable > tbody > tr > td:nth-child(8)").each(
          (_idx, el) => {
            const averagePoints = $(el).text();
            playerAveragePoints.push(averagePoints);
          }
        );

        // market value column
        $("#DataTable > tbody > tr > td:nth-child(9)").each(
          (_idx, el) => {
            const marketValue = $(el).text();
            playerMarketvalue.push(marketValue);
          }
        );


    playerNames.map((el, index) =>
      players.push({
        name: el,
        url: playerURLs[index],
        team: playerTeams[index],
        teamURL: playerTeamURLs[index],
        position: playerPositions[index],
        totalPoints: playerTotalPoints[index],
        averagePoints: playerAveragePoints[index],
        marketValue: playerMarketvalue[index],
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        players
      })
    };
};