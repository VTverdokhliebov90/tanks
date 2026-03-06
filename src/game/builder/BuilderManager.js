import Wall from "./Wall";
import {BuildGroupType, Direction, WallType} from "../Constants";

export default class BuilderManager {
    constructor(scene) {
        this.scene = scene;
        this.tileSize = 16;

        this.walls = {
            brick: scene.physics.add.staticGroup({classType: Wall}),
            steel: scene.physics.add.staticGroup({classType: Wall}),
            water: scene.physics.add.staticGroup({classType: Wall})
        };

        this.decor = {
            bush: scene.add.group({classType: Wall}),
            ice: scene.physics.add.staticGroup({classType: Wall})
        };
    }

    clearMap() {
        const groups = [
            ...Object.values(this.walls), // brick, steel, water, base
            ...Object.values(this.decor)  // bush, ice
        ];

        groups.forEach(group => {
            // true, true — означает:
            // 1. Удалить из сцены
            // 2. Полностью уничтожить объект (очистить память)
            group.clear(true, true);
        });
    }

    buildMapFromMatrix(matrix) {
        matrix.forEach((row, rowIndex) => {
            [...row].forEach((char, colIndex) => {
                switch (char) {
                    case WallType.BRICK.mapSymbol:
                        this.addWallGroup(colIndex, rowIndex, WallType.BRICK);
                        break;
                    case WallType.STEEL.mapSymbol:
                        this.addWallGroup(colIndex, rowIndex, WallType.STEEL);
                        break;
                    case WallType.WATER.mapSymbol:
                        this.addWallGroup(colIndex, rowIndex, WallType.WATER);
                        break;
                    case WallType.BUSH.mapSymbol:
                        this.addWallGroup(colIndex, rowIndex, WallType.BUSH);
                        break;
                    case WallType.ICE.mapSymbol:
                        this.addWallGroup(colIndex, rowIndex, WallType.ICE);
                        break;
                }
            });
        });
    }

    addWallGroup(colIndex, rowIndex, type, buildGroupType = BuildGroupType.FULL) {
        switch (buildGroupType) {
            case BuildGroupType.FULL:
                this.addFullGroup(colIndex, rowIndex, type);
                break;
            case BuildGroupType.TOP:
                this.addTopGroup(colIndex, rowIndex, type);
                break;
            case BuildGroupType.BOTTOM:
                this.addBottomGroup(colIndex, rowIndex, type);
                break;
            case BuildGroupType.LEFT:
                this.addLeftGroup(colIndex, rowIndex, type);
                break;
            case BuildGroupType.RIGHT:
                this.addRightGroup(colIndex, rowIndex, type);
                break;

        }

    }

    addFullGroup(colIndex, rowIndex, type) {
        const {tileSize} = this;
        const centerOffset = tileSize / 4;

        const x = colIndex * tileSize + centerOffset;
        const y = rowIndex * tileSize + centerOffset;

        this.createBlock(x, y, type);
        this.createBlock(x + tileSize / 2, y, type);
        this.createBlock(x, y + tileSize / 2, type);
        this.createBlock(x + tileSize / 2, y + tileSize / 2, type);
    }

    addTopGroup(cPosition, rPosition, type) {
        const {cellSize} = this;
        this.createBlock(cPosition, rPosition, type);
        this.createBlock(cPosition + cellSize / 2, rPosition, type);
    }

    addBottomGroup(cPosition, rPosition, type) {
        const {cellSize} = this;
        this.createBlock(cPosition, rPosition + cellSize / 2, type);
        this.createBlock(cPosition + cellSize / 2, rPosition + cellSize / 2, type);
    }

    addLeftGroup(cPosition, rPosition, type) {
        const {cellSize} = this;
        this.createBlock(cPosition, rPosition, type);
        this.createBlock(cPosition, rPosition + cellSize / 2, type);
    }

    addRightGroup(cPosition, rPosition, type) {
        const {cellSize} = this;
        // this.addWall(cPosition, rPosition, type);
        this.addWall(cPosition + cellSize / 2, rPosition, type);
        // this.addWall(cPosition, rPosition + cellSize / 2, type);
        this.addWall(cPosition + cellSize / 2, rPosition + cellSize / 2, type);
    }

    createBlock(x, y, type) {
        let tile;
        switch (type) {
            case WallType.BRICK:
                tile = new Wall(this.scene, x, y, type);
                this.walls.brick.add(tile);
                break;
            case WallType.STEEL:
                tile = new Wall(this.scene, x, y, type);
                this.walls.steel.add(tile);
                break;
            case WallType.WATER:
                tile = new Wall(this.scene, x, y, type);
                this.walls.water.add(tile);
                break;
            case WallType.BUSH:
                tile = new Wall(this.scene, x, y, type);
                this.decor.bush.add(tile);
                break;
            case WallType.ICE:
                tile = new Wall(this.scene, x, y, type);
                this.decor.ice.add(tile);
                break;
        }
    }

    destroyBlock(x, y, wallType) {
        const group = this.getWallGroupByType(wallType);
        this.destroyWallFromGroup(x, y, group);
    }

    destroyOnBulletCollision(wall, bullet) {
        const offset = 4;
        const bx = bullet.x;
        const by = bullet.y;
        const bulletDirection = bullet.direction;

        const brickGroup = this.getWallGroupByType(WallType.BRICK)
        const stillGroup = this.getWallGroupByType(WallType.STEEL)

        if (bulletDirection === Direction.UP || bulletDirection === Direction.DOWN) {
            this.destroyWallFromGroup(bx - offset, wall.y, brickGroup);
            this.destroyWallFromGroup(bx + offset, wall.y, brickGroup);
        } else {
            this.destroyWallFromGroup(wall.x, by - offset, brickGroup);
            this.destroyWallFromGroup(wall.x, by + offset, brickGroup);
        }

        if (bullet.canBreakSteel) {
            if (bulletDirection === Direction.UP || bulletDirection === Direction.DOWN) {
                this.destroyWallFromGroup(bx - offset, wall.y, stillGroup);
                this.destroyWallFromGroup(bx + offset, wall.y, stillGroup);
            } else {
                this.destroyWallFromGroup(wall.x, by - offset, stillGroup);
                this.destroyWallFromGroup(wall.x, by + offset, stillGroup);
            }
        }

        if (WallType.BRICK === wall.wallType || bullet.canBreakSteel) {
            wall.destroy();
        }
    }

    getWallGroupByType(type) {
        let group;
        switch (type) {
            case WallType.BRICK:
                return this.walls.brick;
            case WallType.STEEL:
                return this.walls.steel;
        }
        return group || this.walls.brick;
    }

    destroyWallFromGroup(x, y, group) {
        group.getChildren().forEach(w => {
            if (w.getBounds().contains(x, y)) {
                w.destroy();
            }
        });
    }


}