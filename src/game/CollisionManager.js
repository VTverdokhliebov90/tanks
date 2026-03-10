import {ParticipantType} from "./Constants";

export default class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    init() {
        const {physics, builderManager, bulletsManager, enemyManager, bonusManager, playerManager, base} = this.scene;
        if (builderManager) {
            if (playerManager) {
                physics.add.collider(builderManager.walls.brick, playerManager.group);
                physics.add.collider(builderManager.walls.steel, playerManager.group);
                physics.add.collider(builderManager.walls.water, playerManager.group);
            }
            if (enemyManager) {
                physics.add.collider(enemyManager.group, enemyManager.group);
                physics.add.collider(builderManager.walls.brick, enemyManager.group, this.enemyFire, null, this);
                physics.add.collider(builderManager.walls.steel, enemyManager.group, this.enemyFire, null, this);
                physics.add.collider(builderManager.walls.water, enemyManager.group);
                if (playerManager) {
                    physics.add.collider(playerManager.group, playerManager.group);
                    physics.add.collider(playerManager.group, enemyManager.group, this.enemyFire);
                }
                if (base) {
                    physics.add.collider(enemyManager.group, base);
                    physics.add.collider(base, playerManager.group);

                }
            }
            if (bulletsManager) {
                physics.add.overlap(bulletsManager.group, bulletsManager.group, this.handleBulletBulletCollision, null, this);
                physics.add.collider(builderManager.walls.brick, bulletsManager.group, this.handleWallBulletCollision, null, this);
                physics.add.collider(builderManager.walls.steel, bulletsManager.group, this.handleWallBulletCollision, null, this);
                physics.add.overlap(enemyManager.group, bulletsManager.group, this.handleEnemyBulletCollision, null, this);
                physics.add.collider(base, bulletsManager.group, this.handleBaseBulletCollision, null, this);
                physics.add.overlap(playerManager.group, bulletsManager.group, this.handlePlayerBulletCollision, null, this);

            }
        }

        physics.add.overlap(playerManager.group, bonusManager.group, this.handlePlayerBonusCollision);
    }

    enemyFire(wall, enemy) {
        enemy.fire();
    }

    handleWallBulletCollision(wall, bullet) {
        this.scene.builderManager.destroyOnBulletCollision(wall, bullet);
        bullet.killBullet();
    }

    handleEnemyBulletCollision(enemy, bullet) {
        if (bullet.ownerType !== ParticipantType.ENEMY) {
            bullet.killBullet();
            enemy.takeDamage();
        }
    }

    handleBaseBulletCollision(base, bullet) {
        bullet.killBullet();
        base.kill();
    }

    handlePlayerBulletCollision(player, bullet) {
        if (bullet.ownerType === ParticipantType.ENEMY) {
            bullet.killBullet();
            player.takeDamage()
        }
    }

    handleBulletBulletCollision(bulletOne, bulletTwo) {
        bulletOne.killBullet();
        bulletTwo.killBullet();
    }

    handlePlayerBonusCollision(player, bonus) {
        bonus.pickUpBonus(player);
    }

}