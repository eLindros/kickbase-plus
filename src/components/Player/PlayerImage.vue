<template>
    <div>
        <ExternalInfo :src="getLigainsiderLink">
            <v-img :src="getPlayerImage" aspect-ratio="1" class="player-card__player-image">
                <template v-slot:placeholder>
            <v-img :src="getPlayerDummy" aspect-ratio="1" class="player-card__player-image"/>
                </template>
            </v-img>
        </ExternalInfo>
        <ExternalInfo v-if="getLigainsiderTeamLink" :src="getLigainsiderTeamLink">
            <v-img :src="teamImage" aspect-ratio="1" class="player-card__team-image" />
        </ExternalInfo>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import ExternalInfo from "../Generic/ExternalInfo";
import { getBundesligaClubImageUrlById } from "@/helper/helper"

export default {
    name: "PlayerImage",
    components: {
        ExternalInfo,
    },
    props: {
        player: {
            required: true,
            type: Object
        },
    },
    computed: {
        ...mapGetters([
            'getPlayers',
            'getMatches',
            'getLigainsiderTeams',
        ]),
        getPlayerImage() {
            return `https://kkstr.s3.amazonaws.com/pool/playersbig/${this.player.id}.png`
        },
        getPlayerDummy() {
            return `https://kickbase.b-cdn.net/pool/teamsdummies/${this.player.teamId}.png`;
        },
        teamImage() {
            return getBundesligaClubImageUrlById(this.player.teamId)
        },
        getLigainsiderLink() {
            if (this.getPlayers[this.player.id]) {
                if (this.getPlayers[this.player.id].ligainsiderId === undefined) {
                    this.addPlayerLigainsiderId(this.player.id);
                }
                if (this.getPlayers[this.player.id].ligainsiderId) {
                    return `https://www.ligainsider.de${this.getPlayers[this.player.id].ligainsiderId}`;
                }
            }
            return undefined;
        },
        getLigainsiderTeamLink() {
            const teamId = this.player.teamId;
            if (teamId && this.getLigainsiderTeams[teamId]) {
                return `https://www.ligainsider.de${this.getLigainsiderTeams[teamId].ligainsiderUrl}`;
            }
            return false;
        },
    },
    methods: {
        ...mapMutations([
            "addPlayerLigainsiderId",
        ]),
    }
}
</script>