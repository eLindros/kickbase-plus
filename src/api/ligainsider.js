import axios from "axios";
import store from "../store/store";

const ligainsider = {
  loadLigainsiderPlayers() {
    axios({
      url: "/.netlify/functions/ligainsider",
      method: "GET",
    })
      .then((response) => {
        if (response.status === 200) {
          store.commit("setLigainsiderPlayers", response.data);
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
