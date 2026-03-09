import Phaser from 'phaser';
import StartScene from './game/scenes/StartScene.js';
import MainScene from './game/scenes/MainScene.js';
import VictoryScene from './game/scenes/VictoryScene.js';
import {WindowConfig} from './game/Constants.js';

new Phaser.Game({
    type: Phaser.AUTO,
    physics: {default: 'arcade'},

    render: {
        pixelArt: true,
        antialias: false
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game-container',
        width: WindowConfig.width,
        height: WindowConfig.height,
        autoCenter: Phaser.Scale.FIT
    },
    input: {
        gamepad: true
    },
    scene: [StartScene, MainScene, VictoryScene],
});