import {ParticipantType} from "./Constants";

export default class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    init() {
        const {physics, builderManager, bulletsManager, enemyManager, bonusManager, player, base} = this.scene;
        if (builderManager) {
            if (player) {
                physics.add.collider(builderManager.walls.brick, player);
                physics.add.collider(builderManager.walls.steel, player);
                physics.add.collider(builderManager.walls.water, player);
            }
            if (enemyManager) {
                physics.add.collider(enemyManager.group, enemyManager.group);
                physics.add.collider(builderManager.walls.brick, enemyManager.group, this.enemyFire, null, this);
                physics.add.collider(builderManager.walls.steel, enemyManager.group, this.enemyFire, null, this);
                physics.add.collider(builderManager.walls.water, enemyManager.group);
                if (player) {
                    physics.add.collider(enemyManager.group, player);
                }
                if (base) {
                    physics.add.collider(enemyManager.group, base);
                    physics.add.collider(base, player);

                }
            }
            if (bulletsManager) {
                physics.add.overlap(bulletsManager.group, bulletsManager.group, this.handleBulletBulletCollision, null, this);
                physics.add.collider(builderManager.walls.brick, bulletsManager.group, this.handleWallBulletCollision, null, this);
                physics.add.collider(builderManager.walls.steel, bulletsManager.group, this.handleWallBulletCollision, null, this);
                physics.add.overlap(enemyManager.group, bulletsManager.group, this.handleEnemyBulletCollision, null, this);
                physics.add.collider(base, bulletsManager.group, this.handleBaseBulletCollision, null, this);
                physics.add.overlap(player, bulletsManager.group, this.handlePlayerBulletCollision, null, this);

            }
        }

        physics.add.overlap(player, bonusManager.group, this.handlePlayerBonusCollision);
    }

    enemyFire(wall, enemy) {
        enemy.fireNow()
    }

    handleWallBulletCollision(wall, bullet) {
        this.scene.builderManager.destroyOnBulletCollision(wall, bullet);
        bullet.destroy();
    }

    handleEnemyBulletCollision(enemy, bullet) {
        if (bullet.ownerType === ParticipantType.PLAYER) {
            bullet.destroy();
            enemy.takeDamage();
        }
    }

    handleBaseBulletCollision(base, bullet) {
        bullet.destroy();
        base.die();
    }

    handlePlayerBulletCollision(player, bullet) {
        if (bullet.ownerType === ParticipantType.ENEMY) {
            bullet.destroy();
            player.takeDamage()
        }
    }

    handleBulletBulletCollision(bulletOne, bulletTwo) {
        // if (bulletOne.ownerType !== bulletTwo.ownerType) {
        bulletOne.destroy();
        bulletTwo.destroy();
        // }
    }

    handlePlayerBonusCollision(player, bonus) {
        bonus.pickUpBonus(player);
        bonus.destroy();
    }

}