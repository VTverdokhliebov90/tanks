import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
    constructor() {
        super({key: 'StartScene'});

        this.selectCount = 1;
        this.playersCount = 1;
    }

    create() {
        const {width, height} = this.scale;

        this.add.text(width / 2, height / 3, 'BATTLE CITY\nREMASTER', {
            fontSize: '42px',
            fill: '#fff',
            align: 'center',
            fontFamily: 'monospace',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.onePlayerText = this.add.text(width / 2, height / 2, '1 PLAYER', {
            fontSize: '24px', fill: '#00ff33', fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.twoPlayersText = this.add.text(width / 2, height / 1.8, '2 PLAYERS', {
            fontSize: '24px', fill: '#fff', fontFamily: 'monospace'
        }).setOrigin(0.5);

        const startText = this.add.text(width / 2, height / 1.55, 'PRESS SPACE TO START', {
            fontSize: '18px', fill: '#888', fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            loop: -1
        });

        this.add.text(width / 2, height / 1.35, 'W,A,S,D - MOVE | SPACE - FIRE', {
            fontSize: '16px',
            fill: '#0f0', // Зеленый цвет, чтобы выделялось
            fontFamily: 'monospace',
            stroke: '#c12e2e',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(width / 2, height - 80, 'Developed by Влад', {
            fontSize: '16px',
            fill: '#888'
        }).setOrigin(0.5);

        this.add.text(width / 2, height - 40, 'Non-commercial fan project.\nAll assets belong to their respective owners.', {
            fontSize: '12px',
            fill: '#555',
            align: 'center'
        }).setOrigin(0.5);


        this.initInputs();

    }

    initInputs() {
        this.input.keyboard.on('keydown-W', () => this.updateSelection(1));
        this.input.keyboard.on('keydown-S', () => this.updateSelection(2));
        this.input.keyboard.on('keydown-UP', () => this.updateSelection(1));
        this.input.keyboard.on('keydown-DOWN', () => this.updateSelection(2));

        this.input.keyboard.once('keydown-SPACE', () => this.startGame());

        this.input.gamepad.on('down', (pad, button) => {
            if (button.index === 8) this.updateSelection(this.playersCount = (this.playersCount === 1) ? 2 : 1); // D-pad Up
            // if (button.index === 13) this.updateSelection(2); // D-pad Down
            if (button.index === 9 || button.index === 0) this.startGame(); // Start или A
        });
    }

    updateSelection(count) {
        this.playersCount = count;
        if (count === 1) {
            this.onePlayerText.setFill('#00ff33');
            this.twoPlayersText.setFill('#fff');
        } else {
            this.onePlayerText.setFill('#fff');
            this.twoPlayersText.setFill('#00ff33');
        }
    }

    startGame() {
        this.scene.start('MainScene', { players: this.playersCount });
    }
}