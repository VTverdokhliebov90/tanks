import Phaser from 'phaser';
import {Depth, BaseProps, WallType, GameAnimations, GameEvents} from './Constants';

export default class Base extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnPoint) {
        super(scene, spawnPoint.x, spawnPoint.y, 'spritesheet_16x16', BaseProps.frame);

        scene.add.existing(this);
        scene.physics.add.existing(this, true); // true = static body (база не двигается)

        this.shieldCoordinates = [];
        this.initShieldCoordinates();
        this.setDepth(Depth.TANK);
        this.isDead = false;

        this.reset();
    }

    initShieldCoordinates() {
        const {x, y} = this;
        const wallBlockSize = 8;
        const startX = x - 12;
        const startY = y + 4;

        this.shieldCoordinates.push({x: startX, y: startY});
        this.shieldCoordinates.push({x: startX, y: startY - wallBlockSize});
        this.shieldCoordinates.push({x: startX, y: startY - wallBlockSize * 2});
        this.shieldCoordinates.push({x: startX + wallBlockSize, y: startY - wallBlockSize * 2});
        this.shieldCoordinates.push({x: startX + wallBlockSize * 2, y: startY - wallBlockSize * 2});
        this.shieldCoordinates.push({x: startX + wallBlockSize * 3, y: startY - wallBlockSize * 2});
        this.shieldCoordinates.push({x: startX + wallBlockSize * 3, y: startY - wallBlockSize});
        this.shieldCoordinates.push({x: startX + wallBlockSize * 3, y: startY});
    }

    reset() {
        this.shieldWallType = WallType.BRICK;
        this.createShield();
    }

    updateShieldWallType(targetShieldWallType) {
        if (this.shieldWallType !== targetShieldWallType) {
            this.removeShield();
            this.shieldWallType = targetShieldWallType;
            this.createShield();
        }
    }

    createShield() {
        const {shieldCoordinates, shieldWallType} = this;
        shieldCoordinates.forEach(({x, y}) => this.buildShieldBlock(x, y, shieldWallType));
    }

    removeShield() {
        const {builderManager} = this.scene;
        this.shieldCoordinates.forEach(point => {
            builderManager.destroyBlock(point.x, point.y, this.shieldWallType);
        });
    }

    buildShieldBlock(x, y, wallType) {
        const {builderManager} = this.scene;
        builderManager.createBlock(x, y, wallType);
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        // 1. Меняем кадр на взорванного орла
        this.setFrame(BaseProps.frame + 1);

        // 2. Создаем большой взрыв
        const explosion = this.scene.add.sprite(this.x, this.y, 'spritesheet_16x16');
        explosion.setScale(2); // База взрывается мощнее танка
        explosion.setDepth(Depth.TANK + 1);
        explosion.play(GameAnimations.EXPLOSION);
        explosion.on(GameAnimations.ANIMATIONCOMPLETE, () => explosion.destroy());

        // 3. Сигналим сцене
        this.scene.events.emit(GameEvents.GAME_OVER);
    }

    applyShovelBonus(duration = BaseProps.shovelTimer) {

        this.stopShieldBlinking();
        if (this.shovelTimer) this.shovelTimer.remove();
        if (this.endTimer) this.endTimer.remove();

        this.updateShieldWallType(WallType.STEEL);

        this.shovelTimer = this.scene.time.delayedCall(7000, () => {
            this.startShieldBlinking();
        });

        this.endTimer = this.scene.time.delayedCall(duration, () => {
            this.stopShieldBlinking();
            this.updateShieldWallType(WallType.BRICK);
        });

    }

    startShieldBlinking() {
        let isSteel = true;
        this.blinkTimer = this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                isSteel = !isSteel;
                const newType = isSteel ? WallType.STEEL : WallType.BRICK;
                this.updateShieldWallType(newType);
            },
            loop: true
        });
    }

    stopShieldBlinking() {
        if (this.blinkTimer) {
            this.blinkTimer.remove();
            this.blinkTimer = null;
        }
    }
}