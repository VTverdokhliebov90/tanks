import StartScene from './game/scenes/StartScene.js';
import MainScene from './game/scenes/MainScene.js';
import VictoryScene from './game/scenes/VictoryScene.js';
import {WindowConfig} from "./game/Constants.js";

new Phaser.Game({
    type: Phaser.AUTO,
    physics: {default: 'arcade'},

    render: {
        pixelArt: true,
        antialias: false
    },
    scale: {
        mode: Phaser.Scale.FIT, // Растягивает игру пропорционально, чтобы она влезла в экран
        parent: 'game-container',
        width: WindowConfig.width,
        height: WindowConfig.height,
        autoCenter: Phaser.Scale.FIT  // Центрирует канвас в браузере
    },
    scene: [StartScene, MainScene, VictoryScene],
});