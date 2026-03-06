import Phaser from "phaser";
import {BonusType, GameEvents as GamepadEvents, StatsPane, WindowConfig} from "../Constants";
import Bonus from "./Bonus";

export default class BonusManager {
    constructor(scene) {
        this.scene = scene;
        this.group = scene.physics.add.group({
            classType: Bonus,
        });

        this.scene.events.on(GamepadEvents.SPAWN_BONUS, () => {
            const bonusType = Phaser.Utils.Array.GetRandom(Object.values(BonusType));
            this.spawnBonus(bonusType);
        });

    }

    spawnBonus(bonusType) {
        const x = Phaser.Math.Between(0, (WindowConfig.width - StatsPane.width) / 16 - 1) * 16 + 8;
        const y = Phaser.Math.Between(0, WindowConfig.height / 16) * 16 + 8;

        return new Bonus(this.scene, x, y, bonusType);
    }



}