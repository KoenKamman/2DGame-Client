import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Ship } from './entities/ship';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('pixiContainer')
  private pixiContainer: ElementRef;
  private app: PIXI.Application;

  private ships: Ship[] = [];

  constructor() {
  }

  public ngOnInit(): void {
    // Create a new PIXI Application
    this.app = new PIXI.Application({
      autoResize: true,
      resolution: devicePixelRatio,
      backgroundColor: 0x1099bb
    });
    this.pixiContainer.nativeElement.appendChild(this.app.view);

    // Resize the canvas
    this.resizeHandler();
    window.addEventListener('resize', this.resizeHandler);

    // Load texture resources
    PIXI.Loader.shared
      .add([
        "assets/player.png"
      ])
      .on("progress", this.loadProgressHandler)
      .load(this.setup);
  }

  /**
   * Resizes the canvas to fit the parent element
   */
  private resizeHandler = (): void => {
    const parent = <Element> this.app.view.parentNode;
    this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
    this.app.stage.position.x = this.app.renderer.width / 2;
    this.app.stage.position.y = this.app.renderer.height / 2;
    this.app.stage.scale.x = 1.0;
    this.app.stage.scale.y = 1.0;
    this.app.stage.pivot.x = 0;
    this.app.stage.pivot.y = 0;
  }

  private loadProgressHandler(loader: PIXI.Loader, resource: PIXI.LoaderResource): void {
    console.log("%c[GAME:LoadingTextures] " + "%c" + loader.progress + "% %c" + resource.name, "color:blue;", "color:red;", "color:green;");
  }

  private setup = (): void => {
    let socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event: MessageEvent) => {
      let data = JSON.parse(event.data);
      for (let i = 0; i < data.players.length; i++) {
        let player = data.players[i];
        let ship = this.ships.find(x => x.id == player.id);
        if (!ship) {
          ship = new Ship(PIXI.Loader.shared.resources["assets/player.png"].texture);
          ship.id = player.id;
          this.ships.push(ship);
          this.app.stage.addChild(ship);
        }
        ship.position.x = player.x;
        ship.position.y = player.y;
        ship.rotation = player.rotation;
      }
    }

    let pointerLocation: PIXI.Point;
    this.app.renderer.plugins.interaction.on('pointermove', (event) => {
      pointerLocation = event.data.getLocalPosition(this.app.stage);
    });
    setInterval(() => {
      socket.send(JSON.stringify(pointerLocation));
    }, 33)
  }

  private lerp(v0: number, v1: number, t: number): number {
    return (1 - t) * v0 + t * v1;
  }


  public ngOnDestroy(): void {

  }

}
