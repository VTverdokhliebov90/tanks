import Player from "./Player";
import {GameConfig, GameEvents} from "../Constants";

export default class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.group = scene.physics.add.group({
            classType: Player,
            runChildUpdate: true,
            collideWorldBounds: true,
        });

        this.players = [];

        this.scene.events.on(GameEvents.PLAYER_LOOSE_TRY, player => {
            if (player.playerTries > 0) {
                scene.time.delayedCall(GameConfig.PLAYER_RESPAWN_DELAY, () => {
                    this.spawn(player.index, true);
                });
            } else {
                const anyPlayerAlive = this.players.some(p => p.playerTries > 0);
                if (!anyPlayerAlive) {
                    this.scene.events.emit(GameEvents.GAME_OVER);
                }
            }
        })

    }

    initPlayer(playerIndex) {
        const player = new Player(this.scene, playerIndex);
        this.players[playerIndex] = player;
        this.group.add(player);
    }

    spawn(playerIndex = 0, resetLevel = false) {
        const player = this.players[playerIndex];
        player.spawnPlayer(resetLevel);

        return player;

    }

    resetForNextLevel() {
        this.players.filter(p => p.playerTries > 0).forEach(p => p.spawnPlayer(false));
    }
}