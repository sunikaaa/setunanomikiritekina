import * as PIXI from 'pixi.js';

export const GameManager = class GameManager {
  public static instance: GameManager;
  public game!: PIXI.Application;

  constructor(app: PIXI.Application) {
    if (GameManager.instance) {
      throw new Error('GameManager can be instantitate only once');
    }

    this.game = app;
  }

  public static start(params: {
    glWidth: number;
    glHeight: number;
    option?: any;
  }): void {
    const game = new PIXI.Application({
      width: params.glWidth,
      height: params.glHeight,
      ...params.option,
    });
    GameManager.instance = new GameManager(game);
    document.body.appendChild(game.view);
    game.ticker.add((delta: number) => {
      //meinroop
    });
  }
};
