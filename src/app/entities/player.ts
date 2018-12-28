import { Container, Sprite, Text } from 'pixi.js';
import { PlayerUpdate } from '../models/PlayerUpdate';

export class Player extends Container {
    private updateBuffer: Array<PlayerUpdate>;

    public sprite: Sprite;
    public nametag: Text;

    constructor(sprite: Sprite, nametag: Text) {
        super();
        this.updateBuffer = new Array<PlayerUpdate>();

        this.sprite = sprite;
        this.sprite.anchor.set(0.5, 0.5);
        this.addChild(sprite);

        this.nametag = nametag;
        this.nametag.anchor.set(0.5, 0.5);
        this.nametag.position.set(0, 50);
        this.addChild(nametag);
    }

    public update(update: PlayerUpdate) {
        if (this.updateBuffer.length >= 2) this.updateBuffer.shift();
        this.updateBuffer.push(update);
    }

    public interpolate(t: number) {
        if (this.updateBuffer.length < 2) return;
        this.position.set(
            lerp(this.updateBuffer[0].x, this.updateBuffer[1].x, t),
            lerp(this.updateBuffer[0].y, this.updateBuffer[1].y, t)
        );
        this.sprite.rotation = lerpRadians(
            this.updateBuffer[0].rotation, this.updateBuffer[1].rotation, t
        );

        function lerp(a: number, b: number, t: number): number {
            return (1 - t) * a + t * b;
        }
        function lerpRadians(a: number, b: number, t: number): number {
            let result: number;
            let diff = b - a;
            if (diff < -Math.PI) {
                b += Math.PI * 2;
                result = lerp(a, b, t);
                if (result >= Math.PI * 2) result -= Math.PI * 2;
            }
            else if (diff > Math.PI) {
                b -= Math.PI * 2;
                result = lerp(a, b, t);
                if (result < 0) result += Math.PI * 2;
            }
            else {
                result = lerp(a, b, t);
            }
            return result;
        }
    }
}