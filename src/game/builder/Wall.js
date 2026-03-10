import Phaser from 'phaser';
import {Depth, WallType} from "../Constants";

export default class Wall extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wallType) {
        super(scene, x, y, 'spritesheet_8x8', wallType.frame);

        this.wallType = wallType;
        if (wallType === WallType.BUSH) {
            this.setBlendMode(Phaser.BlendModes.SCREEN);
            this.setDepth(Depth.BUSH);
        } else {
            this.setDepth(Depth.GROUND);
        }

        scene.add.existing(this);
    }


}