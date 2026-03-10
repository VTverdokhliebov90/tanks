import {STAGES} from "./Levels";
import {GameEvents} from "../Constants";

export default class StageManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = -1;
    }

    initNextLevel() {
        const {builderManager} = this.scene;
        this.currentLevel++;
        builderManager.clearMap();
        builderManager.buildMapFromMatrix(STAGES[this.currentLevel % STAGES.length]);
    }

    isLastLevel() {
        this.scene.events.emit(GameEvents.GAME_COMPLETE);
        return this.currentLevel === STAGES.length - 1;
    }
}