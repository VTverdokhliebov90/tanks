import Phaser from 'phaser';
import {
    BonusType,
    GameConfig,
    BaseProps,
    WindowConfig,
    StatsPane,
    GameEvents, Scenes,
} from "../Constants";
import Player from '../Player.js';
import AnimationManager from '../Animations.js';
import TextureManager from '../TextureManager.js';
import BulletsManager from '../bullet/BulletsManager.js';
import EnemyManager from '../enemy/EnemyManager.js';
import Base from "../Base.js";
import UIManager from "../ui/UIManager.js";
import BonusManager from "../bonus/BonusManager.js";
import BuilderManager from "../builder/BuilderManager.js";
import CollisionManager from "../CollisionManager.js";
import StageManager from "../levels/StageManager.js";

export default class MainScene extends Phaser.Scene {

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.spritesheet('spritesheet_16x16', 'assets/tanks_sheet.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('spritesheet_8x8', 'assets/tanks_sheet.png', {
            frameWidth: 8,
            frameHeight: 8,
            marginTop: 0
        });

    }

    create() {
        this.input.keyboard.addCapture('W,A,S,D,SPACE');
        this.physics.world.setBounds(0, 0, WindowConfig.width - StatsPane.width, WindowConfig.height);

        TextureManager.init(this);
        AnimationManager.init(this);

        this.ui = new UIManager(this);
        this.ui.initEnemyIcons();

        this.builderManager = new BuilderManager(this);
        this.stageManager = new StageManager(this);
        this.bulletsManager = new BulletsManager(this);
        this.bonusManager = new BonusManager(this);
        this.enemyManager = new EnemyManager(this);
        this.collisionManager = new CollisionManager(this);
        this.player = new Player(this, GameConfig.PLAYER_1_SPAWN_POINT);
        this.base = new Base(this, BaseProps.spawnPoint);

        this.collisionManager.init();
        this.initSubscribers();

        // START
        this.loadNextLevel();

        // this.testGenerateBonuses();

    }

    update(time, delta) {
        this.player.update();
    }

    initSubscribers() {
        this.events.on(GameEvents.GAME_OVER, () => {
            this.physics.pause();
            this.add.text(WindowConfig.width / 2, WindowConfig.height / 2, 'GAME OVER', {
                fontSize: '64px',
                fill: '#f00',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.time.delayedCall(GameConfig.LEVEL_START_DELAY, () => this.showStartScene(Scenes.GAME_START_SCENE));
        });

        this.events.on(GameEvents.LEVEL_COMPLETE, () => {
            this.physics.pause();
            this.currentText = this.add.text(WindowConfig.width / 2, WindowConfig.height / 2, 'LEVEL COMPLETE', {
                fontSize: '64px',
                fill: '#f00',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            if (this.stageManager.isLastLevel()) {
                this.time.delayedCall(GameConfig.LEVEL_START_DELAY, () => this.showStartScene(Scenes.GAME_VICTORY_SCENE));
            } else {
                this.time.delayedCall(GameConfig.LEVEL_START_DELAY, () => this.loadNextLevel());
            }
        });

        // this.events.on(GameEvents.GAME_COMPLETE, () => {
        //     this.physics.pause();
        //     this.currentText = this.add.text(WindowConfig.width / 2, WindowConfig.height / 2, 'LEVEL COMPLETE', {
        //         fontSize: '64px',
        //         fill: '#f00',
        //         fontStyle: 'bold'
        //     }).setOrigin(0.5);
        //
        //     this.time.delayedCall(GameConfig.LEVEL_START_DELAY, () => this.showStartScene(Scenes.GAME_VICTORY_SCENE));
        // });
    }

    loadNextLevel() {
        this.stageManager.initNextLevel();
        this.base.reset();
        this.player.spawn(false);
        this.enemyManager.run();
        if (this.currentText) {
            this.currentText.destroy();
        }
        this.physics.resume();
    }

    showStartScene(scene = Scenes.GAME_START_SCENE) {
        this.scene.start(scene);
    }

    restartGame() {
        this.scene.restart();
    }

    testGenerateBonuses() {
        this.bonusManager.spawnBonus(BonusType.HELMET)
        this.bonusManager.spawnBonus(BonusType.HELMET)
        this.bonusManager.spawnBonus(BonusType.HELMET)
        this.bonusManager.spawnBonus(BonusType.CLOCK)
        this.bonusManager.spawnBonus(BonusType.CLOCK)
        this.bonusManager.spawnBonus(BonusType.CLOCK)
        this.bonusManager.spawnBonus(BonusType.SHOVEL)
        this.bonusManager.spawnBonus(BonusType.SHOVEL)
        this.bonusManager.spawnBonus(BonusType.SHOVEL)
        this.bonusManager.spawnBonus(BonusType.STAR)
        this.bonusManager.spawnBonus(BonusType.STAR)
        this.bonusManager.spawnBonus(BonusType.STAR)
        this.bonusManager.spawnBonus(BonusType.GRENADE)
        this.bonusManager.spawnBonus(BonusType.GRENADE)
        this.bonusManager.spawnBonus(BonusType.GRENADE)
        this.bonusManager.spawnBonus(BonusType.TANK)
        this.bonusManager.spawnBonus(BonusType.TANK)
        this.bonusManager.spawnBonus(BonusType.TANK)
        this.bonusManager.spawnBonus(BonusType.GUN)
        this.bonusManager.spawnBonus(BonusType.GUN)
        this.bonusManager.spawnBonus(BonusType.GUN)
    }
}
