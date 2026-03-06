import Phaser from "phaser";
import {BonusType, Depth, GameEvents} from "../Constants";

export default class Bonus extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, bonusType) {
        super(scene, x, y, 'spritesheet_16x16', 191 + bonusType);

        this.setDepth(Depth.BUSH + 1);
        this.bonusType = bonusType;
        scene.tweens.add({targets: this, alpha: 0.5, duration: 200, yoyo: true, repeat: -1});

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.bonusManager.group.add(this);
    }

    pickUpBonus(player) {
        const { scene, bonusType } = this;
        switch (bonusType) {
            case BonusType.STAR:
                player.upLevel();
                break;
            case BonusType.HELMET:
                player.enableShield();
                break;
            case BonusType.TANK:
                player.addTry();
                break;
            case BonusType.GRENADE:
                scene.events.emit(GameEvents.GRENADE_ENEMIES);
                break;
            case BonusType.CLOCK:
                scene.enemyManager.freezeAllEnemies();
                break;
            case BonusType.SHOVEL:
                scene.base.applyShovelBonus();
                break;
            case BonusType.GUN:
                player.upMaxLevel();
                break;
        }
    }
}