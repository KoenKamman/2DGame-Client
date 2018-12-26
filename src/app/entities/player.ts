import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';

export class Player {
    private app: PIXI.Application;
    public sprite: PIXI.Sprite;
    public movementSpeed: number;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.sprite = PIXI.Sprite.from('assets/player.png');
        this.sprite.anchor.set(0.5);
        this.movementSpeed = 1;
        this.app.stage.addChild(this.sprite);
    }

    public shoot(): void {
        let projectile = new Projectile(this.app, this.sprite.position, this.sprite.rotation);
    }

    public followMouse() {
        this.app.renderer.plugins.interaction.on('pointermove', (event) => {
            let pointerLocation = event.data.getLocalPosition(this.app.stage);
            this.sprite.rotation = Math.atan2(pointerLocation.y - this.sprite.y, pointerLocation.x - this.sprite.x);
        });
    }

    public startMoving() {
        this.app.ticker.add(this.moveForward);
    }

    public stopMoving() {
        this.app.ticker.remove(this.moveForward);
    }

    private moveForward = (delta: number) => {
        this.sprite.x = this.sprite.x + this.movementSpeed * Math.cos(this.sprite.rotation) * delta;
        this.sprite.y = this.sprite.y + this.movementSpeed * Math.sin(this.sprite.rotation) * delta;
    }
}