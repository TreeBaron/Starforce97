import { useEffect, useState } from "react";
import { World } from "../../TypeDefinitions";
import classes from "./MapDisplay.module.css";
import { getDistance, randomIntFromInterval } from "../../Factory";
import { ShipStatuses } from "../../TypeDefinitions";

export interface MapDisplayProps {
  world: World;
  globalUpdate: boolean;
  setGlobalUpdate: (value: boolean) => void;
  displaySector: boolean;
  displayQuadrant: boolean;
}

export function MapDisplay({
  world,
  displayQuadrant,
  displaySector,
  globalUpdate,
  setGlobalUpdate,
}: MapDisplayProps) {
  const [text, setText] = useState<string>("");
  const player = world.GetPlayer();
  const getGridValue = (x: number, y: number): any => {
    if (y === 0 && x === 0) return "   ";

    if (x === 0) return y < 10 ? ` ${y} ` : ` ${y}`;

    if (y === 0) return x < 10 ? ` ${x} ` : ` ${x}`;

    let playerPosition = world.GetPlayer().Quadrant;

    let foundShips = world.GameObjects.filter(
      (o) =>
        (o.Quadrant.X === x && o.Quadrant.Y === y && displayQuadrant) ||
        (o.Quadrant.X === playerPosition.X &&
          o.Quadrant.Y === playerPosition.Y &&
          o.Sector.X === x &&
          o.Sector.Y === y &&
          displaySector)
    );

    if (foundShips?.length && foundShips.some((s) => s.IsPlayer)) {
      return `|P|`;
    }

    for (let j = 0; j < foundShips.length; j++) {
      let foundShip = foundShips[j];
      if (foundShip && foundShip.Type === "Torpedo") {
        // Always detect our own torpedoes
        if (foundShip.Team === world.GetPlayer().Team) {
          return foundShip.Name;
        }
        // 1 in 6 we detect enemy torpedo
        else if (
          randomIntFromInterval(1, 6) === 1 ||
          world.GetPlayer().ShortRangeScanDate >= world.Stardate ||
          getDistance(foundShip.Sector, world.GetPlayer().Sector) < 4
        ) {
          player.Condition = ShipStatuses.Red;
          return foundShip.Name;
        }
      }

      if (
        foundShip &&
        foundShip.Type === "Starship" &&
        world.GetPlayer().CanDetectShip(foundShip, world, displayQuadrant)
      ) {
        if (
          player.Condition !== ShipStatuses.Red &&
          displaySector &&
          foundShip.Team !== player.Team
        ) {
          player.Condition = ShipStatuses.Yellow;
        }
        return `${foundShip.Name}`;
      }

      if (foundShip && foundShip.Type === "Planet" && foundShip.NeedsRelief) {
        return `${foundShip.Name}`;
      }
    }

    // pass for things that should not be on top
    for (let j = 0; j < foundShips.length; j++) {
      let foundShip = foundShips[j];
      if (foundShip && foundShip.Type === "Planet") {
        return `${foundShip.Name}`;
      }
    }

    return ` . `;
  };

  useEffect(() => {
    let map = "";
    if (displayQuadrant) {
      map += "\t    QUADRANT MAP\n\n";
    } else {
      map += `\t    SECTOR ${world.GetPlayer().Quadrant.X}-${
        world.GetPlayer().Quadrant.Y
      }\n\n`;
    }

    for (let y = 0; y <= 10; y++) {
      for (let x = 0; x <= 10; x++) {
        map += getGridValue(x, y);
      }
      map += "\r\n";
    }
    setText(map);
    setGlobalUpdate(!globalUpdate);
  }, [world]);

  useEffect(() => {
    if (
      !text.includes("K") ||
      (!text.includes("!T!") &&
        world.GetPlayer().Condition !== ShipStatuses.Green)
    ) {
      world.GetPlayer().Condition = ShipStatuses.Green;
    }
  }, [text]);

  return (
    <div className={classes.container}>
      <textarea
        value={text}
        readOnly={true}
        className={`${classes.textClass} ${
          displayQuadrant ? `color2` : `color1`
        } ${
          displayQuadrant
            ? "colorFadeBackgroundPrimary"
            : "colorFadeBackgroundSecondary"
        }`}
      />
      <div
        className={`${
          displayQuadrant
            ? classes.radarSweepPrimary
            : classes.radarSweepSecondary
        }`}
      ></div>
    </div>
  );
}
