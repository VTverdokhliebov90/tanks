import {EnemyConfig, GameConfig, GameEvents, StatsPane, WindowConfig} from '../Constants';

export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.enemyIcons = [];

        this.currentPlayerTries = GameConfig.INITIAL_PLAYER_TRIES;

        this.createPanelBackground();
        this.createPlayerStats();
        this.createStageInfo();

        this.initEventListeners();

    }

    initEventListeners() {
        this.scene.events.on(GameEvents.PLAYER_ADD_TRY, () => {
            this.currentPlayerTries++;
            this.updateLives();
        });

        this.scene.events.on(GameEvents.PLAYER_LOOSE_TRY, (availableTries) => {
            this.currentPlayerTries = availableTries;
            this.updateLives();
        });

        this.scene.events.on(GameEvents.ENEMY_SPAWNED, () => {
            this.removeEnemyIcon();
        });
    }

    createPanelBackground() {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x757575, 1); // Серый цвет NES-панели
        graphics.fillRect(WindowConfig.width - StatsPane.width, 0, StatsPane.width, WindowConfig.height);
    }

    initEnemyIcons() {
        this.enemyIcons.forEach(icon => icon.destroy());
        this.enemyIcons = [];

        const startX = WindowConfig.width - StatsPane.width + 32 / 2;
        const startY = 24;

        for (let i = 0; i < EnemyConfig.MAX_ENEMIES_ON_LEVEL; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);

            const icon = this.scene.add.image(
                startX + (col < 1 ? -4 : 4),
                startY + (row * 8),
                'spritesheet_8x8',
                49 + 50 * 24 - 9
            );

            this.enemyIcons.push(icon);
        }
    }

    removeEnemyIcon() {
        const icon = this.enemyIcons.pop();
        if (icon) icon.destroy();
    }

    createPlayerStats() {
        const x = WindowConfig.width - StatsPane.width + 12;
        const y = 350;

        // Надпись "1P" или иконка танка

        // Иконка танка рядом с жизнями
        this.scene.add.image(x, y, 'spritesheet_8x8', 999 - 100 - 2);
        this.scene.add.text(x + 4, y - 7, 'P', {fontSize: '11px', fill: '#000', fontStyle: 'bold'});

        this.scene.add.image(x, y + 8, 'spritesheet_8x8', 999 - 50 - 2);
        this.livesText = this.scene.add.text(x + 4, y + 8 - 7, '3', {
            fontSize: '11px',
            fill: '#000',
            fontStyle: 'bold'
        });
    }

    updateLives() {
        if (this.livesText && this.livesText.scene) {
            this.livesText.setText(this.currentPlayerTries.toString());
        }
    }

    createStageInfo() {
        const x = WindowConfig.width - StatsPane.width + 8;
        const y = 450;
        // Иконка флага и номер уровня
        this.scene.add.image(x + 4, y, 'spritesheet_8x8', 999 + 200 - 2); // Индекс флага
        this.scene.add.image(x + 12, y, 'spritesheet_8x8', 999 + 200 - 1); // Индекс флага
        this.scene.add.image(x + 4, y + 8, 'spritesheet_8x8', 999 + 250 - 2); // Индекс флага
        this.scene.add.image(x + 12, y + 8, 'spritesheet_8x8', 999 + 250 - 1); // Индекс флага
        this.stageText = this.scene.add.text(x + 1, y + 9, '1', {
            fontSize: '11px',
            fill: '#000',
            fontStyle: 'bold'
        });
    }
}