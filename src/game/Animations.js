import {Atlas16, Direction, EnemyLevels, GameAnimations, PlayerLevels} from "./Constants";

export default class AnimationManager {
    static init(scene) {
        const playerDirections = [
            {playerIndex: 0, key: Direction.UP, start: 0, end: 1},
            {playerIndex: 0, key: Direction.LEFT, start: 2, end: 3},
            {playerIndex: 0, key: Direction.DOWN, start: 4, end: 5},
            {playerIndex: 0, key: Direction.RIGHT, start: 6, end: 7},
            {playerIndex: 1, key: Direction.UP, start: 0, end: 1},
            {playerIndex: 1, key: Direction.LEFT, start: 2, end: 3},
            {playerIndex: 1, key: Direction.DOWN, start: 4, end: 5},
            {playerIndex: 1, key: Direction.RIGHT, start: 6, end: 7}
        ];

        const enemyDirections = [
            {key: Direction.UP, start: 0, end: 1},
            {key: Direction.LEFT, start: 2, end: 3},
            {key: Direction.DOWN, start: 4, end: 5},
            {key: Direction.RIGHT, start: 6, end: 7}
        ];

        Object.values(PlayerLevels).forEach((value) => {
            playerDirections.forEach(dir => {
                if (!scene.anims.exists(`move-${dir.playerIndex}-${value.level}-${dir.key}`)) {
                    scene.anims.create(
                        {
                            key: `move-${dir.playerIndex}-${value.level}-${dir.key}`,
                            frames: scene.anims.generateFrameNumbers(Atlas16, {
                                start: value.frame[dir.playerIndex] + dir.start,
                                end: value.frame[dir.playerIndex] + dir.end
                            }),
                            frameRate: 10,
                            repeat: -1
                        });
                }
            });
        });

        EnemyLevels.forEach(enemyLevelSettings => {
            enemyDirections.forEach(dir => {
                if (!scene.anims.exists(`moveEnemy-${enemyLevelSettings.level}-${dir.key}`)) {
                    scene.anims.create(
                        {
                            key: `moveEnemy-${enemyLevelSettings.level}-${dir.key}`,
                            frames: scene.anims.generateFrameNumbers(Atlas16, {
                                start: enemyLevelSettings.frame + dir.start,
                                end: enemyLevelSettings.frame + dir.end
                            }),
                            frameRate: 10,
                            repeat: -1
                        });
                }
            });
        });

        if (!scene.anims.exists(GameAnimations.EXPLOSION)) {
            scene.anims.create(
                {
                    key: GameAnimations.EXPLOSION,
                    frames: scene.anims.generateFrameNumbers(Atlas16, {start: 216, end: 218}),
                    frameRate: 15,
                    hideOnComplete: true
                });
        }

        if (!scene.anims.exists(GameAnimations.SPAWN_STAR)) {
            scene.anims.create(
                {
                    key: GameAnimations.SPAWN_STAR,
                    frames: scene.anims.generateFrameNumbers(Atlas16, {start: 166, end: 169}),
                    frameRate: 10,
                    repeat: 3
                });
        }
        if (!scene.anims.exists(GameAnimations.SHIELD_LOOP)) {
            scene.anims.create(
                {
                    key: GameAnimations.SHIELD_LOOP,
                    frames: scene.anims.generateFrameNumbers(Atlas16, {start: 241, end: 242}),
                    frameRate: 20,
                    repeat: -1
                });
        }
    }
}