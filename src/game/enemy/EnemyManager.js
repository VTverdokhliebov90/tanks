import EnemyTank from './EnemyTank.js';
import {EnemySpawnPoints, EnemyConfig, EnemyLevels, GameEvents, GameAnimations} from '../Constants.js';

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;

        this.group = scene.physics.add.group({
            classType: EnemyTank,
            runChildUpdate: true,
            collideWorldBounds: true,
        });


        this.isFrozen = false;
        this.freezeTimer = null;
        this.spawnPosition = 1;
        this.reservEmount = EnemyConfig.MAX_ENEMIES_ON_LEVEL;

        this.initEventListeners();

    }

    run() {
        this.isFrozen = false;
        this.freezeTimer = null;
        this.spawnPosition = 1;
        this.reservEmount = EnemyConfig.MAX_ENEMIES_ON_LEVEL;

        this.spawnTimer = this.scene.time.addEvent({
            delay: EnemyConfig.SPAWN_INTERVAL,
            callback: this.trySpawn,
            callbackScope: this,
            loop: true
        });
        this.trySpawn();
    }

    initEventListeners() {
        this.scene.events.on(GameEvents.ENEMY_DIE, () => {
            console.log("ACTIVE " + this.findActiveEnemies());
            console.log("RESERVED " + this.reservEmount);
            if (this.findActiveEnemies() <= 0 && this.reservEmount <= 0) {
                this.scene.events.emit(GameEvents.LEVEL_COMPLETE);
            }
        });
    }

    trySpawn() {
        const maxToSpawn = EnemyConfig.MAX_ACTIVE_ENEMIES - this.findActiveEnemies();

        if (this.reservEmount > 0) {
            for (let i = 0; i < Math.min(maxToSpawn, 3, this.reservEmount); i++) {
                this.spawnWithAnimation(EnemySpawnPoints[this.spawnPosition % 3]);
                this.spawnPosition++;
                this.reservEmount--;
            }
        }
    }

    spawnWithAnimation(spawnPoint) {
        const spawnStar = this.scene.add.sprite(spawnPoint.x, spawnPoint.y, 'spritesheet_16x16');
        spawnStar.play(GameAnimations.SPAWN_STAR);
        spawnStar.on(GameAnimations.ANIMATIONCOMPLETE, () => {
            const tankType = Phaser.Utils.Array.GetRandom(Object.values(EnemyLevels));
            const enemy = this.group.get(spawnPoint.x, spawnPoint.y, tankType);
            if (enemy) {
                if (this.isFrozen) enemy.freeze();
                else enemy.changeDirection();
            }
            this.scene.events.emit(GameEvents.ENEMY_SPAWNED);
            spawnStar.destroy();
        });
    }

    freezeAllEnemies(freezeTime = EnemyConfig.ENEMY_FREEZE_TIME) {
        this.isFrozen = true;

        // 1. Очищаем старый таймер, если он был
        if (this.freezeTimer) this.freezeTimer.remove();

        // 2. Фризим текущих
        this.group.getChildren().forEach(enemy => {
            if (enemy.active) enemy.freeze();
        });

        // 3. Создаем новый таймер (используем delayedCall — это проще)
        this.freezeTimer = this.scene.time.delayedCall(freezeTime, () => {
            this.unfreezeAllEnemies();
        }, [], this);
    }

    unfreezeAllEnemies() {
        this.isFrozen = false;
        this.freezeTimer = null;

        this.group.getChildren().forEach(enemy => {
            if (enemy.active) enemy.unfreeze();
        });
    }

    findActiveEnemies() {
        return this.group.countActive(true);
    }

}