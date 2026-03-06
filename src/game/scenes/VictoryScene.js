export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        const { width, height } = this.scale;

        // 1. Золотой заголовок
        this.add.text(width / 2, height / 4, 'MISSION ACCOMPLISHED', {
            fontSize: '32px',
            fill: '#ffcc00',
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 2. Текст благодарности
        this.add.text(width / 2, height / 2,
            'Thanks for game!\n\nYou have successfully defended the base\nand defeated the enemy forces.', {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);

        // 3. Подпись (твое имя/ник для портфолио)
        this.add.text(width / 2, height - 100, 'Developed by Влад', {
            fontSize: '16px',
            fill: '#888'
        }).setOrigin(0.5);

        // 4. Кнопка возврата в меню
        const retryBtn = this.add.text(width / 2, height - 50, 'PRESS SPACE TO MENU', {
            fontSize: '20px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        // Мигание кнопки
        this.tweens.add({ targets: retryBtn, alpha: 0, duration: 800, yoyo: true, loop: -1 });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('StartScene');
        });
    }
}