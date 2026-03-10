export const Atlas16 = 'spritesheet_16x16';
export const Atlas08 = 'spritesheet_8x8';
export const GameEvents = {
    WORLDBOUNDS: 'worldbounds',
    PLAYER_ADD_TRY: 'player-add-try',
    PLAYER_LOOSE_TRY: 'player-loose-try',
    ENEMY_DIE: 'enemy-die',
    GAME_OVER: 'game-over',
    LEVEL_COMPLETE: 'level-complete',
    GAME_COMPLETE: 'game-complete',
    SPAWN_BONUS: 'SPAWN_BONUS',
    GRENADE_ENEMIES: 'GRENADE_ENEMIES',
    ENEMY_SPAWNED: 'ENEMY_SPAWNED',
}

export const GameAnimations = {
    ANIMATIONCOMPLETE: 'animationcomplete',
    SPAWN_STAR: 'spawn-star',
    EXPLOSION: 'explosion',
    SHIELD_LOOP: 'shield-loop',
}

export const StatsPane = {
    width: 16 * 2
}

// Игровое поле — это квадрат 496(31)x400(25) тайлов (по 16px).
export const WindowConfig = {
    width: 496 + StatsPane.width,
    height: 496 - 16 * 6,
}

export const centerColumnNumber = (WindowConfig.width - 16) / 2 / 16 + 1;
export const lastRowNumber = WindowConfig.height / 16;
export const BuildGroupType = {
    FULL: 0,
    TOP: 1,
    BOTTOM: 2,
    LEFT: 3,
    RIGHT: 4,
}

export const BaseProps = {
    frame: 69,
    shovelTimer: 10000,
    spawnPoint: {x: (WindowConfig.width - StatsPane.width) / 2, y: WindowConfig.height - 8},
    shieldCoordinates: [
        {r: lastRowNumber - 0, c: centerColumnNumber - 1, buildGroupType: BuildGroupType.RIGHT},
        {r: lastRowNumber - 1, c: centerColumnNumber - 1, buildGroupType: BuildGroupType.RIGHT},
        {r: lastRowNumber - 1, c: centerColumnNumber + 0, buildGroupType: BuildGroupType.BOTTOM},
        {r: lastRowNumber - 1, c: centerColumnNumber + 1, buildGroupType: BuildGroupType.LEFT},
        {r: lastRowNumber - 0, c: centerColumnNumber + 1, buildGroupType: BuildGroupType.LEFT}
    ]
}

export const GameConfig = {
    BONUS_START_FRAME: 191,
    PLAYER_SPEED: 50,
    INITIAL_PLAYER_TRIES: 3,
    BULLET_SPEED: 150,
    GRID_SIZE: 8,
    PLAYER_SPAWN_SHIELD_DURATION: 3000,
    PLAYER_SHIELD_DURATION: 10000,
    PLAYER_RESPAWN_DELAY: 2000,
    LEVEL_START_DELAY: 3000,
};

export const PlayersConfig = {
    players: [
        {
            index: 0,
            spawnPoint: {x: (WindowConfig.width - StatsPane.width) / 2 - 16 - 16, y: WindowConfig.height - 8}
        },
        {
            index: 1,
            spawnPoint: {x: (WindowConfig.width - StatsPane.width) / 2 + 16 + 16, y: WindowConfig.height - 8}
        }
    ]
}

export const WallType = {
    EMPTY: {frame: 50 * 9 - 1 - 17, mapSymbol: '.'},
    BRICK: {frame: 50 * 9 - 1 - 17, mapSymbol: '#'},
    STEEL: {frame: 50 * 10 - 1 - 17, mapSymbol: '@'},
    WATER: {frame: 50 * 11 - 1 - 17, mapSymbol: '~'},
    BUSH: {frame: 50 * 10 - 1 - 16, mapSymbol: '*'},
    ICE: {frame: 50 * 10 - 1 - 15, mapSymbol: '%'}
};

export const Depth = {
    GROUND: 0,
    WATER: 5,
    BULLET: 10,
    TANK: 15,
    BUSH: 20
};

export const Direction = {
    NONE: 'none',
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

export const EnemySpawnPoints = [
    {x: 8, y: 8},
    {x: (WindowConfig.width - StatsPane.width) / 2, y: 8},
    {x: (WindowConfig.width - StatsPane.width) - 8, y: 8}
];

export const EnemyConfig = {
    MAX_ENEMIES_ON_LEVEL: 20,
    MAX_ACTIVE_ENEMIES: 6,
    SPAWN_INTERVAL: 5000,
    ENEMY_FREEZE_TIME: 5000,
    FIRE_DELAY: 2000,
};

export const EnemyLevels = [
    {level: 0, frame: 108, speed: 50, bulletSpeed: 150, hpRange: [1, 1]},
    {level: 1, frame: 133, speed: 90, bulletSpeed: 150, hpRange: [1, 1]},
    {level: 2, frame: 158, speed: 60, bulletSpeed: 250, hpRange: [1, 2]},
    {level: 3, frame: 183, speed: 50, bulletSpeed: 150, hpRange: [3, 4]}
]

export const EnemyHealthColorMap = [
    0xFFFFFF,
    0x9ACD32,
    0x4682B4,
    0xFFA500,
]

export const BonusType = {
    HELMET: 0,     // Неуязвимость
    CLOCK: 1,      // Заморозить врагов
    SHOVEL: 2,     // Бетонная защита вокруг базы на время
    STAR: 3,       // Апгрейд танка
    GRENADE: 4,    // Взорвать всех врагов на экране
    TANK: 5,       // Дополнительная жизнь
    GUN: 6        // Дополнительная жизнь
};

export const PlayerLevels = [
    {level: 0, frame: [0, 200], speed: 50, bulletSpeed: 150, maxBullets: 1, canBreakSteel: false},
    {level: 1, frame: [25, 225], speed: 65, bulletSpeed: 250, maxBullets: 1, canBreakSteel: false},
    {level: 2, frame: [50, 250], speed: 65, bulletSpeed: 250, maxBullets: 2, canBreakSteel: false},
    {level: 3, frame: [75, 275], speed: 75, bulletSpeed: 300, maxBullets: 2, canBreakSteel: true}
];

export const ParticipantType = {
    PLAYER: 'player',
    ENEMY: 'enemy',
}

export const Scenes = {
    GAME_START_SCENE: 'StartScene',
    GAME_VICTORY_SCENE: 'VictoryScene',
}




