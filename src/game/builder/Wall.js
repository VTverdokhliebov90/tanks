import Phaser from 'phaser';
import {Depth, WallType} from "../Constants";

export default class Wall extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wallType) {
        super(scene, x, y, 'spritesheet_8x8', wallType.frame);
        this.setBlendMode(Phaser.BlendModes.SCREEN);

        this.wallType = wallType;
        if (wallType === WallType.BUSH) {
            this.setDepth(Depth.BUSH);
            this.setAlpha(0.7);
        } else {
            this.setDepth(Depth.GROUND);
        }

        scene.add.existing(this);
    }


}