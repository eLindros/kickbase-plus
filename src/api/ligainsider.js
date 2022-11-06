import axios from "axios";
import store from "../store/store";

const ligainsiderURL = 'https://kickbase-plus-elindros.koyeb.app/ligainsider';

const axiosInstance = axios.create()

const ligainsider = {
  async loadLigainsiderPlayers() {
    axiosInstance({
      url: ligainsiderURL,
      method: "GET",
      headers: {
        common: {
          "Authorization": ""
        }
      }
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
