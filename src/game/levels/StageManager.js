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
        console.log("CL " + this.currentLevel)
        console.log("SL " + (STAGES.length - 1))
        console.log(this.currentLevel === STAGES.length - 1)
        return this.currentLevel === STAGES.length - 1;
    }

    resetLevels() {
        this.currentLevel = -1;
    }
}