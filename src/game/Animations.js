import {Atlas16, Direction, EnemyLevels, PlayerLevels} from "./Constants";

export default class AnimationManager {
    static init(scene) {
        const playerDirections = [
            {key: Direction.UP, start: 0, end: 1},
            {key: Direction.LEFT, start: 2, end: 3},
            {key: Direction.DOWN, start: 4, end: 5},
            {key: Direction.RIGHT, start: 6, end: 7}
        ];

        const enemyDirections = [
            {key: Direction.UP, start: 0, end: 1},
            {key: Direction.LEFT, start: 2, end: 3},
            {key: Direction.DOWN, start: 4, end: 5},
            {key: Direction.RIGHT, start: 6, end: 7}
        ];

        Object.entries(PlayerLevels).forEach(([key, value]) => {
            playerDirections.forEach(dir => {
                if (!scene.anims.exists(`move-${value.level}-${dir.key}`)) {
                    scene.anims.create({
                        key: `move-${value.level}-${dir.key}`,
                        frames: scene.anims.generateFrameNumbers(Atlas16, {
                            start: value.frame + dir.start,
                            end: value.frame + dir.end
                        }),
                        frameRate: 10,
                        repeat: -1
                    });
                }
            });
        });


        Object.entries(EnemyLevels).forEach(([key, value]) => {
            enemyDirections.forEach(dir => {
                if (!scene.anims.exists(`moveEnemy-${value.level}-${dir.key}`)) {
                    scene.anims.create({
                        key: `moveEnemy-${value.level}-${dir.key}`,
                        frames: scene.anims.generateFrameNumbers(Atlas16, {
                            start: value.frame + dir.start,
                            end: value.frame + dir.end
                        }),
                        frameRate: 10,
                        repeat: -1
                    });
                }
            });
        });

        // Сюда же можно добавить анимацию взрыва или появления звезды (спавна)
        if (!scene.anims.exists('explosion')) {
            scene.anims.create({
                key: 'explosion',
                frames: scene.anims.generateFrameNumbers(Atlas16, {start: 216, end: 218}), // пример кадров
                frameRate: 15,
                hideOnComplete: true
            });
        }

        if (!scene.anims.exists('spawn-star')) {
            scene.anims.create({
                key: 'spawn-star',
                frames: scene.anims.generateFrameNumbers(Atlas16, {start: 166, end: 169}), // проверь индексы звезды
                frameRate: 10,
                repeat: 3
            });
        }
        if (!scene.anims.exists('shield-loop')) {
            scene.anims.create({
                key: 'shield-loop',
                frames: scene.anims.generateFrameNumbers(Atlas16, {start: 241, end: 242}),
                frameRate: 20,
                repeat: -1
            });
        }
    }
}