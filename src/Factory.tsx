import {
  ShipStatuses,
  Starship,
  Vector2,
  Teams,
  World,
  Torpedo,
} from "./TypeDefinitions";
import { Planet } from "./TypeDefinitions";

export const randomIntFromInterval = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

function getRandomVector2() {
  return {
    X: randomIntFromInterval(1, 10),
    Y: randomIntFromInterval(1, 10),
  } as Vector2;
}

export const toDegrees = (angle: number) => {
  return angle * (180 / Math.PI);
};

export const toRadians = (angle: number) => {
  return angle * (Math.PI / 180);
};

export const getDistance = (vector1: Vector2, vector2: Vector2) => {
  let distance = Math.sqrt(
    Math.pow(vector1.X - vector2.X, 2) + Math.pow(vector1.Y - vector2.Y, 2)
  );
  return distance;
};

export const fireTorpedo = (starship: Starship, degrees: number) => {
  if (starship.IsPlayer) {
    degrees = 360 - degrees; // flip vertically cause of how we display the map
  }
  let radianAngle = toRadians(degrees);
  let position: Vector2 = {
    X: starship.Sector.X,
    Y: starship.Sector.Y,
  } as Vector2;
  starship.ShipLog.push("[TORPEDO] - Torpedo away captain! Bearing " + degrees);
  starship.RadarLog.push("Tracking torpedo launch captain.");
  starship.RadarLog.push(`Torpedo Position: (${position.X}, ${position.Y})`);
  let direction: Vector2 = {
    X: Math.cos(radianAngle),
    Y: Math.sin(radianAngle),
  };
  let torpedo = getTorpedo(
    starship,
    { X: starship.Quadrant.X, Y: starship.Quadrant.Y } as Vector2,
    position,
    direction
  );
  return torpedo;
};

export const onDeath = (starship: Starship, world: World) => {
  starship.IsDead = true;
  if (!starship.IsPlayer) {
    world.GetPlayer().DisplayScreen = "src/assets/shipexploding.gif";
  }
};

export const getTorpedo = (
  starship: Starship,
  quadrant: Vector2,
  sector: Vector2,
  velocity: Vector2
) => {
  return {
    Sector: sector,
    ActualPosition: { X: sector.X, Y: sector.Y } as Vector2,
    Quadrant: quadrant,
    Velocity: velocity,
    Name: starship.IsPlayer ? "(T)" : "(!)",
    Team: starship.Team,
    Type: "Torpedo",
    IsDead: false,
    Update: function (this: Torpedo, world: World) {
      // Update position
      this.ActualPosition.X = this.ActualPosition.X + velocity.X;
      this.ActualPosition.Y = this.ActualPosition.Y + velocity.Y;

      this.Sector.X = Math.floor(Math.round(this.ActualPosition.X));
      this.Sector.Y = Math.floor(Math.round(this.ActualPosition.Y));

      // check for any collisions
      for (let s = 0; s < world.GameObjects.length; s++) {
        let ship: any = world.GameObjects[s];
        // shitty type check for starship type
        if (
          ship.Team !== this.Team &&
          ship.Type !== "Torpedo" &&
          this.Quadrant.X === ship.Quadrant.X &&
          this.Quadrant.Y === ship.Quadrant.Y
        ) {
          if (
            equalVectors(ship.Sector, this.Sector) ||
            (ship.IsPlayer === false &&
              getDistance(ship.Sector, this.ActualPosition) < 0.75)
          ) {
            if (ship.Type === "Planet") {
              world
                .GetPlayer()
                .ShipLog.push(`Torpedo impacted planet and was destroyed.`);
              this.IsDead = true;
            } else if (ship.Type === "Starship") {
              world
                .GetPlayer()
                .ShipLog.push(
                  `[KILL] - ${ship.Name} was hit by a torpedo and destroyed.`
                );
              onDeath(ship, world);
              this.IsDead = true;
            }
            return;
          }
        }
      }

      if (
        this.Sector.X > 10 ||
        this.Sector.X < 0 ||
        this.Sector.Y > 10 ||
        this.Sector.Y < 0
      ) {
        starship.ShipLog.push("[TORPEDO] - Torpedo missed!");
        this.IsDead = true;
        return;
      }
    },
  } as Torpedo;
};

export const equalVectors = (a: Vector2, b: Vector2) => {
  if (a === null && b === null) return false;
  if (a === null || b === null) return false;
  if (a.X === b.X && a.Y === b.Y) {
    return true;
  }
  return false;
};

export const getWorld = (
  setWorld: (world: World) => void,
  difficulty: number
) => {
  const localDate = 1200;
  let world: World = {
    Stardate: localDate,
    ClearDisplayScreen: false,
    GameWon: false,
    GameObjects: [
      getPlayership({ X: 3, Y: 4 } as Vector2, { X: 5, Y: 5 } as Vector2),
    ],
    GetPlayer: function () {
      return this.GameObjects.find((x) => x.IsPlayer === true);
    },
    Update: function (this: World) {
      const player = this.GetPlayer();
      if (player.DisplayScreen !== null) {
        if (this.ClearDisplayScreen === false) {
          this.ClearDisplayScreen = true;
        } else {
          player.DisplayScreen = null;
        }
      }

      player.Update(this);

      // Do not move stardate increase
      this.Stardate++;
      for (let i = 0; i < this.GameObjects.length; i++) {
        let go = this.GameObjects[i];
        if (!go.IsPlayer && go.Update) {
          go.Update(this);
        }
      }
      setWorld({
        ...this,
        GameObjects: this.GameObjects.filter(
          (o) => o.IsDead === false || o.IsPlayer === true
        ),
        Stardate: this.Stardate,
      });

      // Check for win conditions

      // no enemies left alive
      let enemies = this.GameObjects.filter(
        (go) =>
          go.Type === "Starship" &&
          go.Team != Teams.Coalition &&
          go.IsPlayer === false
      );

      // all planets are discovered
      let planetsNeedingDiscovery = this.GameObjects.filter(
        (go) => go.Type === "Planet" && go.NeedsDiscovery
      );

      // all planets have received aid that need it
      let planetsNeedingAidStill = this.GameObjects.filter(
        (go) =>
          go.Type === "Planet" &&
          go.NeedsRelief === true &&
          go.ReceivedRelief === false
      );

      if (
        enemies.length === 0 &&
        planetsNeedingDiscovery.length === 0 &&
        planetsNeedingAidStill.length === 0
      ) {
        player.ShipLog.push("[VICTORY]");
        this.GameWon = true;
        this.SetWorld({ ...this });
      }

      player.ShipLog.push(`[END TURN]`);
      player.ShipLog.push("");
      player.ShipLog.push("[BEGIN TURN]");
    },
    SetWorld: setWorld,
  } as World;

  for (let i = 0; i < difficulty * 6; i++) {
    let enemyShip = getKronShip(getRandomVector2(), getRandomVector2(), i + 10);
    while (true) {
      let foundCollision = world.GameObjects.find(
        (o) =>
          o.Quadrant.X === enemyShip.Quadrant.X &&
          o.Quadrant.Y === enemyShip.Quadrant.Y &&
          o.Sector.X === enemyShip.Sector.X &&
          o.Sector.Y === enemyShip.Sector.Y
      );

      if (foundCollision) {
        enemyShip.Quadrant = getRandomVector2();
        enemyShip.Sector = getRandomVector2();
      } else {
        break;
      }
    }
    world.GameObjects.push(enemyShip);
  }

  const planetNames = [
    "Arageth",
    "Arttaeh I",
    "Aruer",
    "Arupun",
    "Centauri",
    "Cestus",
    "Clinmep Prime",
    "Cliffen",
    "Dangerymian",
    "Dantasp",
    "Dataen",
    "Datag I",
    "Datag II",
    "Datag III",
    "Arttaeh II",
    "Doodlebug",
    "Jutter",
    "Fit",
    "Elbin",
    "Lexon",
    "Lenack",
    "Linack",
    "Nebulan",
    "Nexar",
    "Parutte",
    "Paruer",
    "Plex",
    "Quomik",
  ];

  const planetDescriptions = [
    "Originally an M class planet until an asteroid impact nearly 27 years ago.",
    "Previously a mining world, abandoned equipment can still be found on the surface.",
    "Despite being of little value as a planet, this world has been the center of many territorial disputes.",
    "With a population of nearly 500,000 this planet hosts one of the largest underground colonies to ever exist.",
    "Populated by 12 members of a research outpost.",
    "Large oil and coal reserves discovered here 3 years ago indicate this planet once harbored life.",
    "This planet contains an unusually large number of underground salt-water lakes.",
    "This rocky world has no notable features.",
    "Used for nuclear waste disposal and weapons development.",
    "Data on this planet has been classified under order 598.",
    "Used primarily as a prison-planet.",
    "Factory world claimed by DTC and Lorum Enterprises.",
    "It is believed this planet has a hollow core. Scientists make yearly visits to collect seismograph data.",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Computer data on this planet is corrupted.",
    "",
    "",
    "",
    "",
    "",
  ];

  for (let i = 1; i <= 28 / difficulty; i++) {
    world.GameObjects.push({
      Sector: getRandomVector2(),
      Quadrant: getRandomVector2(),
      Image: `src/assets/planets/planet (${i}).png`,
      Name: ` O `,
      Detail: planetNames[i - 1],
      Description:
        planetDescriptions[i - 1] === "" ? null : planetDescriptions[i - 1],
      CanRefuel: false,
      Type: "Planet",
      IsDead: false,
      NeedsRelief: false,
      ReceivedRelief: false,
      NeedsDiscovery: false,
    } as Planet);
  }

  // inhabitable planets
  const populatedPlanetNames = [
    "Sherman's Planet",
    "LV-426",
    "Arcadia 234",
    "Alpha Centauri",
    "Titan",
    "Eva Prime",
  ];

  const populatedPlanetDescriptions = [
    "Primarily an agricultural hub, this planet provides grain for the entire quadrant.",
    "Mainly provides a steady source of income due to the rich franchise which can be found here.",
    "Originally a trash planet, this colony world is now home to over 12 million people.",
    "One of the first colonized worlds it requires resilient souls to live on this barely habitable world.",
    "One of the largest and well-built colony worlds, Titan has a population of over a billion.",
    "EVA Prime started as a promising colony but after a 3rd asteroid impact algae blooms began poisoning the oceans.",
  ];

  const populatedPlanetLocations: Vector2[] = [
    { X: 1, Y: 2 } as Vector2,
    { X: 5, Y: 4 } as Vector2,
    { X: 4, Y: 7 } as Vector2,
    { X: 10, Y: 1 } as Vector2,
    { X: 2, Y: 9 } as Vector2,
    { X: 8, Y: 8 } as Vector2,
  ];

  for (let i = 1; i <= 6; i++) {
    world.GameObjects.push({
      Sector: {
        X: 5 + randomIntFromInterval(-1, 1),
        Y: 5 + randomIntFromInterval(-1, 1),
      } as Vector2,
      Quadrant: populatedPlanetLocations[i - 1],
      Image: `src/assets/planets/earthlike/planet${i}.png`,
      Name: `(+)`,
      Detail: populatedPlanetNames[i - 1],
      Description:
        populatedPlanetDescriptions[i - 1] === ""
          ? null
          : populatedPlanetDescriptions[i - 1],
      CanRefuel: false,
      Type: "Planet",
      IsDead: false,
      NeedsRelief: true,
      ReceivedRelief: false,
      NeedsDiscovery: false,
    } as Planet);
  }

  // Ancient space station
  world.GameObjects.push({
    Sector: {
      X: 3,
      Y: 8,
    } as Vector2,
    Quadrant: {
      X: 6,
      Y: 10,
    } as Vector2,
    Image: `src/assets/planets/earthlike/ancientstation.jpeg`,
    Name: ` . `,
    Detail: "Ancient Station",
    Description: null,
    DiscoveryText:
      "In the middle of desolation a lone transponder continues to send a faint signal from a now ancient station offering up the secrets of the universe in exchange for peace. The scars of battle have not yet faded from its surface and perhaps they never will.",
    CanRefuel: false,
    Type: "Planet",
    IsDead: false,
    NeedsRelief: false,
    ReceivedRelief: false,
    NeedsDiscovery: true,
  } as Planet);

  // get all planets and cache their images so the visuals load faster
  let planets = world.GameObjects.filter((go) => go.Type === "Planet");
  world.CachedImagePaths = planets.map((x) => x.Image);
  world.CachedImagePaths.push(`"src/assets/victoryimage.jpeg`);
  world.CachedImagePaths.push("src/assets/happyorphans.jpeg");
  world.CachedImagePaths.push("src/assets/starbackground.png");
  world.CachedImagePaths.push("src/assets/playershipexploding.gif");
  world.CachedImagePaths.push("src/assets/starfield.gif");
  world.CachedImagePaths.push("src/assets/shipexploding.gif");
  world.CachedImagePaths.push("src/assets/enemyshiphitbylaser.gif");
  world.CachedImagePaths.push("src/assets/playershiphitbylaser.gif");

  return world;
};

export const repairChance = (starship: Starship) => {
  if (starship.CanFireLasers === false && randomIntFromInterval(1, 6) === 1) {
    starship.CanFireLasers = true;
    starship.ShipLog.push("[REPAIR] - Our lasers have been repaired sir.");
    return;
  }
  if (starship.CanLRS === false && randomIntFromInterval(1, 6) === 1) {
    starship.CanLRS = true;
    starship.ShipLog.push(
      "[REPAIR] - Our Long Range Scanners have been repaired sir."
    );
    return;
  }
  if (starship.CanSRS === false && randomIntFromInterval(1, 6) === 1) {
    starship.CanSRS = true;
    starship.ShipLog.push(
      "[REPAIR] - Our Short Range Scanners have been repaired sir."
    );
    return;
  }
  if (starship.CanMoveSectors === false && randomIntFromInterval(1, 6) === 1) {
    starship.CanMoveSectors = true;
    starship.ShipLog.push("[REPAIR] - Thrusters are back online sir!");
    return;
  }
  if (
    starship.CanMoveQuadrants === false &&
    randomIntFromInterval(1, 6) === 1
  ) {
    starship.CanMoveQuadrants = true;
    starship.ShipLog.push("[REPAIR] - Warp drive is back online sir!");
    return;
  }
  if (
    starship.CanFireTorpedoes === false &&
    randomIntFromInterval(1, 6) === 1
  ) {
    starship.CanFireTorpedoes = true;
    starship.ShipLog.push(
      "[REPAIR] - The torpedo bay fire has been extinguished sir!"
    );

    if (randomIntFromInterval(1, 12) === 1) {
      starship.ShipLog.push(
        "[FIRE] - A torpedo has caught fire in the bay sir!"
      );
      starship.ShipLog.push("[FIRE] - All hands prepare to ab-");
      starship.IsDead = true;
    }
    return;
  }
};

const canDetectShip = function (
  ourShip: Starship,
  enemyShip: Starship,
  world: World,
  isQuadrant: boolean
) {
  if (isQuadrant) {
    if (
      ourShip.LongRangeScanDate == world.Stardate &&
      getDistance(ourShip.Quadrant, enemyShip.Quadrant) <= 2
    ) {
      return true;
    } else if (enemyShip.LongRangeScanDate == world.Stardate) {
      return true;
    }
    return false;
  } else if (equalVectors(ourShip.Quadrant, enemyShip.Quadrant)) {
    // 1 in 6 chance
    if (randomIntFromInterval(1, 6) === 1) {
      return true;
    }
    if (ourShip.ShortRangeScanDate == world.Stardate) {
      return true;
    } else if (enemyShip.ShortRangeScanDate == world.Stardate) {
      return true;
    } else if (getDistance(enemyShip.Sector, ourShip.Sector) < 4) {
      return true;
    }
    return false;
  }
};

const takeDamage = function (ourShip: Starship, damageDealer: Starship) {
  let chance = 6;

  if (damageDealer.IsPlayer) {
    chance -= 2;
  }

  if (ourShip.ShieldsUp && ourShip.Energy >= 50) {
    ourShip.Energy -= 50;
    ourShip.ShipLog.push(
      "[ENERGY] - Shields are holding but have drained 50 additional energy."
    );
    chance += 3;
  }

  if (randomIntFromInterval(1, chance) === 1 && ourShip.ShieldsUp === false) {
    ourShip.ShipLog.push(
      `\n[DAMAGE] - The ship's fusion core was hit directly by enemy laser fire creating a sector-wide explosion. There were no survivors.`
    );
    damageDealer.ShipLog.push(
      `[KILL] - Direct hit on their fusion core! ${ourShip.Name} has been destroyed.`
    );
    ourShip.IsDead = true;
  }

  if (ourShip.IsDead) return;

  ourShip.ShipLog.push(
    `[DAMAGE] - ${damageDealer.Name} has hit us with a laser salvo.`
  );
  damageDealer.ShipLog.push(`[ATTACK] - Firing lasers at ${ourShip.Name}!`);
  if (randomIntFromInterval(1, chance) === 1) {
    ourShip.CanMoveQuadrants = false;
    ourShip.ShipLog.push("Warp drive has taken damage and is disabled!");
    damageDealer.ShipLog.push(`Their warp drive is offline.`);
  }
  if (randomIntFromInterval(1, chance) === 1) {
    ourShip.CanMoveSectors = false;
    ourShip.ShipLog.push("Thrusters are malfunctioning.");
    damageDealer.ShipLog.push(
      `Their thrusters are damaged, they can't maneuver sir.`
    );
  }
  if (randomIntFromInterval(1, chance) === 1) {
    ourShip.CanLRS = false;
    ourShip.ShipLog.push("Long Range Scanners are offline.");
    damageDealer.ShipLog.push(`We hit their long range scan array.`);
  }
  if (randomIntFromInterval(1, chance) === 1) {
    ourShip.CanSRS = false;
    ourShip.ShipLog.push("We've lost our short range radar.");
    damageDealer.ShipLog.push(
      `Their short range radar is offline. They're blind!`
    );
  }
  if (randomIntFromInterval(1, chance) === 1) {
    ourShip.CanFireTorpedoes = false;
    ourShip.ShipLog.push("The torpedo bay is on fire, unable to launch.");
    damageDealer.ShipLog.push(`We hit their torpedo bay, they can't launch.`);
  }

  if (randomIntFromInterval(1, chance) === 1) {
    ourShip.CanFireLasers = false;
    ourShip.ShipLog.push("Our laser batteries are toast sir.");
    damageDealer.ShipLog.push(`Their laser weapon system is damaged.`);
  }

  if (damageDealer.IsPlayer && damageDealer.DisplayScreen === null) {
    damageDealer.DisplayScreen = "src/assets/enemyshiphitbylaser.gif";
  } else if (ourShip.IsPlayer && ourShip.DisplayScreen === null) {
    ourShip.DisplayScreen = "src/assets/playershiphitbylaser.gif";
  }
};

const playerUpdateFunction = function (ourShip: Starship, world: World) {
  repairChance(ourShip);
  let orbitingPlanet = world.GameObjects.find(
    (x) =>
      equalVectors(ourShip.Quadrant, x.Quadrant) &&
      equalVectors(ourShip.Sector, x.Sector) &&
      x.Type === "Planet"
  );

  if (orbitingPlanet) {
    ourShip.Energy += 25;
    ourShip.ShipLog.push(
      "[ENERGY] - Received 25 energy from orbital solar array."
    );
  }

  if (ourShip.ShieldsUp && ourShip.Energy > 25) {
    ourShip.Energy -= 25;
    ourShip.ShipLog.push("[ENERGY] - Shields consumed 25 energy.");
  }

  if (ourShip.ShieldsUp && ourShip.Energy < 25) {
    ourShip.ShieldsUp = false;
  }

  ourShip.Energy += 10;

  if (ourShip.Energy > 1200) {
    ourShip.Energy = 1200;
  }

  // mysterious signal code
  // 4,7 or 2,9 or 8,8
  let sayBearing = false;
  if (ourShip.Quadrant.X === 4 && ourShip.Quadrant.Y === 7) {
    sayBearing = true;
  }
  if (ourShip.Quadrant.X === 2 && ourShip.Quadrant.Y === 9) {
    sayBearing = true;
  }
  if (ourShip.Quadrant.X === 8 && ourShip.Quadrant.Y === 8) {
    sayBearing = true;
  }

  if (sayBearing) {
    // Make sure we are orbiting a planet...
    let planets = world.GameObjects.filter(
      (go) =>
        go.Type === "Planet" &&
        equalVectors(ourShip.Sector, go.Sector) === true &&
        equalVectors(ourShip.Quadrant, go.Quadrant) === true
    );

    if (planets.length >= 1) {
      let angle = getAIFiringAngle(ourShip.Quadrant, {
        X: 6,
        Y: 10,
      } as Vector2);
      angle += 180;
      angle = (360 - angle) % 360;
      ourShip.ShipLog.push(
        `[MYSTERY SIGNAL] - Captain receiving mystery signal from Quadrant bearing ${Math.round(
          angle
        )} degrees`
      );
    }
  }

  // if in 6,10 then ship position to 3,8
  if (ourShip.Quadrant.X === 6 && ourShip.Quadrant.Y === 10) {
    let angle = getAIFiringAngle(ourShip.Sector, { X: 3, Y: 8 } as Vector2);
    angle += 180;
    angle = (360 - angle) % 360;
    ourShip.ShipLog.push(
      `[MYSTERY SIGNAL] - Captain receiving strong local signal bearing ${Math.round(
        angle
      )} degrees`
    );
  }
};

const getAIFiringAngle = (a: Vector2, b: Vector2) => {
  var dy = a.Y - b.Y;
  var dx = a.X - b.X;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  return theta;
};

const aiUpdateFunction = function (ourShip: Starship, world: World) {
  if (ourShip.IsDead) return;

  repairChance(ourShip);
  // AI logic
  let printDebug = false && ourShip.Name === "K1";
  let moves = {
    Wait: { name: "wait", cost: -10 },
    MoveQuadrant: { name: "moveq", cost: 100 },
    MoveSector: { name: "moves", cost: 5 },
    FireLasers: { name: "lasers", cost: 150 },
    FireTorpedo: { name: "torpedo", cost: 0 },
    SRS: { name: "srs", cost: 0 },
    LRS: { name: "lrs", cost: 0 },
  };

  let truthTable = {
    sameQuadrantAsPlayer: false,
    enemyTorpedoNearby: false,
    playerInLaserRange: false,
  };

  let player = world.GetPlayer();
  // check if we can detect the player in sector
  if (ourShip.CanDetectShip(player, world, false) === true) {
    ourShip.AIData.playerLastSpottedSector = {
      X: player.Sector.X,
      Y: player.Sector.Y,
    } as Vector2;
    truthTable.sameQuadrantAsPlayer = true;
    if (printDebug) {
      console.log("Detected player in this sector.");
    }
  }

  // in quadrant
  if (ourShip.CanDetectShip(player, world, true) === true) {
    ourShip.AIData.playerLastSpottedQuadrant = {
      X: player.Quadrant.X,
      Y: player.Quadrant.Y,
    } as Vector2;
    if (
      equalVectors(ourShip.Quadrant, ourShip.AIData.playerLastSpottedQuadrant)
    ) {
      if (printDebug) {
        console.log("Detected player in this quadrant.");
      }
      ourShip.AIData.sameQuadrantAsPlayer = true;
    }
  }

  // Do we detect any enemy torpedoes nearby?
  let enemyTorpedoes = world.GameObjects.filter(
    (x) =>
      x.Type === "Torpedo" &&
      x.Team !== ourShip.Team &&
      equalVectors(x.Quadrant, ourShip.Quadrant)
  );

  // Look for enemy torpedoes
  for (let i = 0; i < enemyTorpedoes.length; i++) {
    // 1 in 6 chance we detect them
    if (
      randomIntFromInterval(1, 6) === 1 &&
      // torpedo is less than 3 distance away
      getDistance(enemyTorpedoes[i].Sector, ourShip.Sector) < 3
    ) {
      truthTable.enemyTorpedoNearby = true;
    }
  }

  if (
    truthTable.sameQuadrantAsPlayer &&
    getDistance(ourShip.AIData.playerLastSpottedSector, ourShip.Sector) < 4
  ) {
    truthTable.playerInLaserRange = true;
  } else {
    truthTable.playerInLaserRange = false;
  }

  if (printDebug) {
    console.log(truthTable);
    console.log(ourShip.AIData);
    console.log("SECTOR: " + ourShip.Sector.X + " - " + ourShip.Sector.Y);
    console.log("QUADRANT: " + ourShip.Quadrant.X + " - " + ourShip.Quadrant.Y);
  }

  if (
    truthTable.enemyTorpedoNearby &&
    ourShip.Energy > moves.MoveSector.cost &&
    ourShip.CanMoveSectors
  ) {
    // if there is a nearby enemy torpedo, move a random direction to dodge it
    ourShip.Energy -= moves.MoveSector.cost;
    ourShip.Sector.X += randomIntFromInterval(-1, 1);
    ourShip.Sector.Y += randomIntFromInterval(-1, 1);
    ourShip.Sector.X = Math.min(ourShip.Sector.X, 10);
    ourShip.Sector.X = Math.max(1, ourShip.Sector.X);
    ourShip.Sector.Y = Math.min(ourShip.Sector.Y, 10);
    ourShip.Sector.Y = Math.max(1, ourShip.Sector.Y);
    if (printDebug) {
      console.log("Moving sector due to nearby enemy torpedo.");
    }
    return;
  }

  // if we are in the same quadrant as the player, fire torpedo towards them
  if (
    truthTable.sameQuadrantAsPlayer &&
    ourShip.Torpedoes >= 1 &&
    ourShip.CanFireTorpedoes &&
    (Math.abs(world.Stardate - ourShip.AIData.stardateSpottedSector) < 3 ||
      truthTable.playerInLaserRange) &&
    randomIntFromInterval(1, 3) === 1
  ) {
    ourShip.Torpedoes -= 1;
    let degreesToFire = getAIFiringAngle(
      ourShip.Sector,
      ourShip.AIData.playerLastSpottedSector
    );
    degreesToFire += 180; // map display related??
    let torpedo = fireTorpedo(ourShip, Math.abs(degreesToFire));
    world.GameObjects.push(torpedo);
    if (printDebug) {
      console.log("Firing torpedo at nearby player. Angle: " + degreesToFire);
    }
    return;
  }

  // if we are in the same quadrant as the player, and in laser range fire lasers
  if (
    truthTable.sameQuadrantAsPlayer &&
    ourShip.Energy > moves.FireLasers.cost &&
    truthTable.playerInLaserRange &&
    ourShip.CanFireLasers
  ) {
    player.TakeDamage(ourShip);
    if (printDebug) {
      console.log("Firing lasers at nearby player.");
    }
    return;
  }

  // if our quadrant data is out of date, do a long-range-scan
  if (
    Math.abs(ourShip.AIData.stardateSpottedQuadrant - world.Stardate) > 8 &&
    ourShip.CanLRS
  ) {
    ourShip.LongRangeScanDate = world.Stardate + 1;
    ourShip.AIData.stardateSpottedQuadrant = world.Stardate + 1;
    if (printDebug) {
      console.log("Conducting long range scan.");
    }
    return;
  }

  // if our sector data is out of date and we are in the players quadrant, do a short-range-scan
  if (
    Math.abs(ourShip.AIData.stardateSpottedQuadrant - world.Stardate) > 3 &&
    truthTable.sameQuadrantAsPlayer &&
    ourShip.CanSRS
  ) {
    ourShip.ShortRangeScanDate = world.Stardate + 1;
    ourShip.AIData.stardateSpottedSector = world.Stardate + 1;
    if (printDebug) {
      console.log("Conducting short range scan.");
    }
    return;
  }

  // Move quadrant towards player, if we are close already
  if (
    ourShip.Energy > moves.MoveQuadrant.cost &&
    getDistance(ourShip.Quadrant, ourShip.AIData.playerLastSpottedQuadrant) <
      2 &&
    !equalVectors(ourShip.Quadrant, ourShip.AIData.playerLastSpottedQuadrant) &&
    ourShip.CanMoveQuadrants
  ) {
    ourShip.Energy -= moves.MoveQuadrant.cost;
    if (randomIntFromInterval(1, 2) === 1) {
      if (ourShip.Quadrant.X < ourShip.AIData.playerLastSpottedQuadrant.X) {
        ourShip.Quadrant.X += 1;
      } else {
        ourShip.Quadrant.X -= 1;
      }
    } else {
      if (ourShip.Quadrant.Y < ourShip.AIData.playerLastSpottedQuadrant.Y) {
        ourShip.Quadrant.Y += 1;
      } else {
        ourShip.Quadrant.Y -= 1;
      }
    }
    ourShip.Quadrant.X = Math.min(ourShip.Quadrant.X, 10);
    ourShip.Quadrant.X = Math.max(1, ourShip.Quadrant.X);
    ourShip.Quadrant.Y = Math.min(ourShip.Quadrant.Y, 10);
    ourShip.Quadrant.Y = Math.max(1, ourShip.Quadrant.Y);
    if (printDebug) {
      console.log("Moving quadrant towards player.");
    }
    return;
  }

  // Move into laser range and engage if needed
  if (
    truthTable.sameQuadrantAsPlayer &&
    truthTable.playerInLaserRange === false &&
    ourShip.Torpedoes <= 0 &&
    ourShip.Energy > moves.MoveSector.cost &&
    ourShip.CanMoveSectors
  ) {
    ourShip.Energy -= moves.MoveSector.cost;
    if (randomIntFromInterval(1, 2) === 1) {
      if (ourShip.Sector.X < ourShip.AIData.playerLastSpottedSector.X) {
        ourShip.Sector.X += 1;
      } else {
        ourShip.Sector.X -= 1;
      }
    } else {
      if (ourShip.Sector.Y < ourShip.AIData.playerLastSpottedSector.Y) {
        ourShip.Sector.Y += 1;
      } else {
        ourShip.Sector.Y -= 1;
      }
    }
    ourShip.Sector.X = Math.min(ourShip.Sector.X, 10);
    ourShip.Sector.X = Math.max(1, ourShip.Sector.X);
    ourShip.Sector.Y = Math.min(ourShip.Sector.Y, 10);
    ourShip.Sector.Y = Math.max(1, ourShip.Sector.Y);
    if (printDebug) {
      console.log("Moving sector towards player to get in laser range.");
    }
    return;
  }

  // move randomly
  if (randomIntFromInterval(1, 3) === 1 && ourShip.Energy > 300) {
    // Move quadrant towards player, if we are close already
    if (ourShip.Energy > moves.MoveQuadrant.cost && ourShip.CanMoveQuadrants) {
      ourShip.Energy -= moves.MoveQuadrant.cost;
      ourShip.Quadrant.X = ourShip.Quadrant.X + randomIntFromInterval(-1, 1);
      ourShip.Quadrant.Y = ourShip.Quadrant.Y + randomIntFromInterval(-1, 1);
      ourShip.Quadrant.X = Math.min(ourShip.Quadrant.X, 10);
      ourShip.Quadrant.X = Math.max(1, ourShip.Quadrant.X);
      ourShip.Quadrant.Y = Math.min(ourShip.Quadrant.Y, 10);
      ourShip.Quadrant.Y = Math.max(1, ourShip.Quadrant.Y);
      if (printDebug) {
        console.log("Moving quadrant randomly.");
      }
      return;
    }
  }

  if (printDebug) {
    console.log("AI waiting. Energy: " + ourShip.Energy);
  }
  // Just wait and recharge energy
  ourShip.Energy += moves.Wait.cost * -1;
};

export const getPlayership = (quadrant: Vector2, sector: Vector2) => {
  return {
    ShipLog: [
      "[EARTH TRANSMISSION]",
      "This is admiral Zhukov. The Kron have destroyed our fleet " +
        "and invaded our space. Their forces took heavy losses but " +
        "enough Kron vessels remain to decimate our colonies and " +
        "launch an attack on Earth. Your ship the S.S. NAUTILUS " +
        "is our only remaining battlecruiser. You must stop the " +
        "Kron before they can finish the job. You must save Earth and her colonies.\n",
      "[MISSION OBJECTIVES]",
      "[1] - Destroy all enemy vessels in the quadrant.",
      "[2] - Provide relief supplies to at least 6 planets (marked with (+) on your map).",
      "[3] - Discover source of mysterious transmission the Kron are searching for.\n",
      "[BEGIN TURN]",
    ],
    RadarLog: ["Passive radar is active."],
    IsPlayer: true,
    Condition: ShipStatuses.Green,
    Quadrant: quadrant,
    Sector: sector,
    Torpedoes: 10,
    Energy: 1200,
    ShieldsUp: false,
    ShortRangeScanDate: -1,
    LongRangeScanDate: -1,
    Team: Teams.Coalition,
    Name: "S.S. Nautilus",
    IsDead: false,
    CanMoveQuadrants: true,
    CanMoveSectors: true,
    CanLRS: true,
    CanSRS: true,
    CanFireTorpedoes: true,
    CanFireLasers: true,
    TakeDamage: function localTakeDamage(this: Starship, enemy: Starship) {
      takeDamage(this, enemy);
    },
    Update: function localUpdate(this: Starship, world: World) {
      playerUpdateFunction(this, world);
    },
    CanDetectShip: function localCanDetectShip(
      this: Starship,
      enemyShip: Starship,
      world: World,
      isQuadrant: boolean
    ) {
      return canDetectShip(this, enemyShip, world, isQuadrant);
    },
    Type: "Starship",
  } as Starship;
};

export const getKronShip = (
  quadrant: Vector2,
  sector: Vector2,
  name: number
) => {
  return {
    ShipLog: ["Captain assumes command."],
    RadarLog: [],
    Type: "Starship",
    IsPlayer: false,
    IsDead: false,
    Condition: ShipStatuses.Red,
    Quadrant: quadrant,
    Sector: sector,
    Torpedoes: 3,
    Energy: 1200,
    ShieldsUp: false,
    ShortRangeScanDate: -1,
    LongRangeScanDate: -1,
    Team: Teams.Kron,
    Name: `K${name}`,
    CanMoveQuadrants: true,
    CanMoveSectors: true,
    CanLRS: true,
    CanSRS: true,
    CanFireTorpedoes: true,
    CanFireLasers: true,
    TakeDamage: function localTakeDamage(this: Starship, enemy: Starship) {
      takeDamage(this, enemy);
    },
    Update: function localUpdate(this: Starship, world: World) {
      aiUpdateFunction(this, world);
    },
    CanDetectShip: function localCanDetectShip(
      this: Starship,
      enemyShip: Starship,
      world: World,
      isQuadrant: boolean
    ) {
      return canDetectShip(this, enemyShip, world, isQuadrant);
    },
    // Randomize to help make AI behavior not seem 100% deterministic
    AIData: {
      playerLastSpottedQuadrant: {
        X: randomIntFromInterval(1, 10),
        Y: randomIntFromInterval(1, 10),
      } as Vector2,
      playerLastSpottedSector: {
        X: randomIntFromInterval(1, 10),
        Y: randomIntFromInterval(1, 10),
      } as Vector2,
      stardateSpottedQuadrant: 1200 + randomIntFromInterval(-8, 0),
      stardateSpottedSector: 1200 + randomIntFromInterval(-8, 0),
    },
  } as Starship;
};
