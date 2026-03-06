export default class TextureManager {
    static init(scene) {
        const sheet = scene.textures.get('spritesheet_16x16');

        // Если кадр уже есть (при рестарте), не добавляем заново
        // if (sheet.has('bullet_frame_up')) return;

        // Нарезаем пули
        sheet.add('bullet_frame_up',    0, 321, 100, 8, 8);
        sheet.add('bullet_frame_down',  0, 337, 100, 8, 8);
        sheet.add('bullet_frame_left',  0, 328, 100, 8, 8);
        sheet.add('bullet_frame_right', 0, 344, 100, 8, 8);

        // Можно сюда же добавить кадр для "Орла" (Штаба)
        // sheet.add('base_alive', 0, x, y, 16, 16);
        // sheet.add('base_dead',  0, x, y, 16, 16);

        // И кадр для "Звезды" спавна
        // sheet.add('spawn_star', 0, x, y, 16, 16);
    }
}