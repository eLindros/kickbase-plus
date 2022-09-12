import axios from "axios";
import { load } from "cheerio";
import store from "../store/store";

const ligainsider = {
  loadLigainsiderPlayers() {
    axios({
      url: "https://www.ligainsider.de/stats/kickbase/marktwerte/gesamt/",
      method: "GET",
    })
      .then((response) => {
        if (response.status === 200) {
          const html = response.data;
          const $ = load(html);

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
          $("#DataTable > tbody > tr > td:nth-child(5)").each((_idx, el) => {
            const position = $(el).text();
            playerPositions.push(position);
          });

          // total points column
          $("#DataTable > tbody > tr > td:nth-child(6)").each((_idx, el) => {
            const totalPoints = $(el).text();
            playerTotalPoints.push(totalPoints);
          });

          // average points column
          $("#DataTable > tbody > tr > td:nth-child(8)").each((_idx, el) => {
            const averagePoints = $(el).text();
            playerAveragePoints.push(averagePoints);
          });

          // market value column
          $("#DataTable > tbody > tr > td:nth-child(9)").each((_idx, el) => {
            const marketValue = $(el).text();
            playerMarketvalue.push(marketValue);
          });

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

          store.commit("setLigainsiderPlayers", players);
        }
      })
      .catch(function () {
        store.commit(
          "setErrorLoadingMessage",
          "could not fetch ligainsider data"
        );
        store.commit("setErrorMessage", "could not fetch ligainsider data");
      });
  },
};

export default ligainsider;
