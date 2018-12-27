import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Ship } from './entities/ship';
import { Logger } from './util/logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('pixiContainer')
  private pixiContainer: ElementRef;
  private app: PIXI.Application;

  private playerShip: Ship;
  private ships: Array<Ship>;

  constructor() {
    this.ships = new Array<Ship>();
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
        "assets/player.png",
        "assets/enemyPlayer.png"
      ])
      .on("progress", (loader: PIXI.Loader, resource: PIXI.LoaderResource) => {
        Logger.loading("LoadingTextures", loader.progress, resource.name);
      })
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

  private setup = (): void => {
    let socket = new WebSocket("ws://localhost:8080");

    // Receive messages from server
    socket.onmessage = (event: MessageEvent) => {
      let message = JSON.parse(event.data);
      switch(message.type) {
        case "snapshot":
          this.renderSnapshot(message.data);
          break;
        case "disconnect":
          this.removePlayer(message.data);
          break;
        case "identifier":
          this.spawnPlayer(message.data);
          break;
      }
    }

    // Send input to server
    let pointerLocation: PIXI.Point;
    this.app.renderer.plugins.interaction.on('pointermove', (event) => {
      pointerLocation = event.data.getLocalPosition(this.app.stage);
    });
    setInterval(() => {
      socket.send(JSON.stringify(pointerLocation));
    }, 33)
  }

  private removePlayer(id: number) {
    this.app.stage.removeChild(this.ships.find(ship => ship.id == id));
    this.ships = this.ships.filter(ship => ship.id !== id);
    Logger.log("RemovedPlayer", "Player with ID #" + id + "disconnected");
  }

  private spawnPlayer(id: number) {
    this.playerShip = new Ship(PIXI.Loader.shared.resources["assets/player.png"].texture);
    this.playerShip.id = id;
    this.app.stage.addChild(this.playerShip);
    Logger.log("SpawnedPlayer", "Spawned player with ID #" + id);
  }

  private spawnEnemyPlayer(id: number): Ship {
    let ship = new Ship(PIXI.Loader.shared.resources["assets/enemyPlayer.png"].texture);
    ship.id = id;
    this.ships.push(ship);
    this.app.stage.addChild(ship);
    Logger.log("SpawnedEnemyPlayer", "Spawned enemy player with ID #" + id);
    return ship;
  }

  private updatePlayer(ship: Ship, update) {
    ship.position.x = update.x;
    ship.position.y = update.y;
    ship.rotation = update.rotation;
  }

  private renderSnapshot(snapshot) {
    for (let i = 0; i < snapshot.players.length; i++) {
      let player = snapshot.players[i];
      let ship: Ship;

      if (player.id === this.playerShip.id) {
        ship = this.playerShip;
      } else {
        ship = this.ships.find(x => x.id == player.id);
      }

      if (!ship) {
        ship = this.spawnEnemyPlayer(player.id);
      }

      this.updatePlayer(ship, player);

    }
  }

  private lerp(v0: number, v1: number, t: number): number {
    return (1 - t) * v0 + t * v1;
  }


  public ngOnDestroy(): void {

  }

}
