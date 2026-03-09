import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const { width, height } = this.scale;

        // 1. Логотип
        this.add.text(width / 2, height / 3, 'BATTLE CITY\nREMASTER', {
            fontSize: '42px',
            fill: '#fff',
            align: 'center',
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 2. Инструкция (Кнопка старта)
        const startText = this.add.text(width / 2, height / 1.6, 'PRESS SPACE TO START', {
            fontSize: '20px',
            fill: '#ff0',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            loop: -1
        });

        // 3. ПОДСКАЗКА ПО УПРАВЛЕНИЮ (Новый блок)
        this.add.text(width / 2, height / 1.35, 'W,A,S,D - MOVE | SPACE - FIRE', {
            fontSize: '16px',
            fill: '#0f0', // Зеленый цвет, чтобы выделялось
            fontFamily: 'monospace',
            stroke: '#c12e2e',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 4. Копирайты
        this.add.text(width / 2, height - 80, 'Developed by Влад', {
            fontSize: '16px',
            fill: '#888'
        }).setOrigin(0.5);

        this.add.text(width / 2, height - 40, 'Non-commercial fan project.\nAll assets belong to their respective owners.', {
            fontSize: '12px',
            fill: '#555',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainScene');
        });
    }

}