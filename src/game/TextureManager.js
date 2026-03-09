import {Atlas16} from "./Constants";

export default class TextureManager {
    static init(scene) {
        const sheet = scene.textures.get(Atlas16);

        sheet.add('bullet_frame_up',    0, 321, 100, 8, 8);
        sheet.add('bullet_frame_down',  0, 337, 100, 8, 8);
        sheet.add('bullet_frame_left',  0, 328, 100, 8, 8);
        sheet.add('bullet_frame_right', 0, 344, 100, 8, 8);
    }
}