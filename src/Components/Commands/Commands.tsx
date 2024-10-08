import { useEffect, useState } from "react";
import {
  Form,
  Button,
  Col,
  Row,
  Container,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { Arrows } from "./Components/Arrows";
import { ShipStatuses, Vector2, World } from "../../TypeDefinitions";
import classes from "./Commands.module.css";
import angleImage from "../../assets/angleImage.png";
import { equalVectors, fireTorpedo, getDistance } from "../../Factory";

export interface CommandProps {
  world: World;
  globalUpdate: boolean;
  setGlobalUpdate: (value: boolean) => void;
  setWorld: (world: World) => void;
}

export function Commands({
  world,
  setWorld,
  setGlobalUpdate,
  globalUpdate,
}: CommandProps) {
  const [degrees, setDegress] = useState<number>();
  const [worldNeedsUpdate, setWorldNeedsUpdate] = useState<boolean>(false);
  const player = world.GetPlayer();
  const tooltipTime = 1500;

  useEffect(() => {
    if (worldNeedsUpdate) {
      setWorldNeedsUpdate(false);
      world.Update();
    }
  }, [world, worldNeedsUpdate, setWorldNeedsUpdate]);

  const getCleanCoords = (
    v: Vector2,
    overX?: () => void,
    underX?: () => void,
    overY?: () => void,
    underY?: () => void
  ) => {
    if (v.X > 10) {
      v.X = v.X % 10;
      if (overX) {
        overX();
      }
    }

    if (v.Y > 10) {
      v.Y = v.Y % 10;
      if (overY) {
        overY();
      }
    }

    if (v.X < 1) {
      v.X = v.X + 10;
      if (underX) {
        underX();
      }
    }

    if (v.Y < 1) {
      v.Y = v.Y + 10;
      if (underY) {
        underY();
      }
    }

    return v;
  };

  const LogMovement = () => {
    player.ShipLog.push(
      `[MOVE] - Ship jumped to Q[${player.Quadrant.X}-${player.Quadrant.Y}] S[${player.Sector.X}-${player.Sector.Y}]`
    );
  };

  const MoveUpQ = () => {
    player.Energy -= 100;
    player.Quadrant.Y += 1;
    player.Quadrant = getCleanCoords(player.Quadrant);
    LogMovement();
    world.Update();
  };
  const MoveDownQ = () => {
    player.Energy -= 100;
    player.Quadrant.Y -= 1;
    player.Quadrant = getCleanCoords(player.Quadrant);
    LogMovement();
    world.Update();
  };
  const MoveLeftQ = () => {
    player.Energy -= 100;
    player.Quadrant.X -= 1;
    player.Quadrant = getCleanCoords(player.Quadrant);
    LogMovement();
    world.Update();
  };
  const MoveRightQ = () => {
    player.Energy -= 100;
    player.Quadrant.X += 1;
    player.Quadrant = getCleanCoords(player.Quadrant);
    LogMovement();
    world.Update();
  };

  const MoveUpS = () => {
    player.Energy -= 5;
    player.Sector.Y += 1;
    player.Sector = getCleanCoords(player.Sector, undefined, undefined, () => {
      MoveUpQ();
    });
    world.Update();
  };
  const MoveDownS = () => {
    player.Energy -= 5;
    player.Sector.Y -= 1;
    player.Sector = getCleanCoords(
      player.Sector,
      undefined,
      undefined,
      undefined,
      () => {
        MoveDownQ();
      }
    );
    world.Update();
  };
  const MoveLeftS = () => {
    player.Energy -= 5;
    player.Sector.X -= 1;
    player.Sector = getCleanCoords(player.Sector, undefined, () => {
      MoveLeftQ();
    });
    world.Update();
  };
  const MoveRightS = () => {
    player.Energy -= 5;
    player.Sector.X += 1;
    player.Sector = getCleanCoords(player.Sector, () => {
      MoveRightQ();
    });
    world.Update();
  };
  const displayDegrees = 360 - (degrees || 0);

  const inLaserRange = () => {
    let targets = world.GameObjects.filter(
      (x) =>
        x.Quadrant &&
        equalVectors(x.Quadrant, player.Quadrant) &&
        x.Team != player.Team &&
        x.Type === "Starship"
    );

    if (targets.length === 0) {
      return false;
    }

    // Note distance to PLAYER
    let nearestTarget = targets.sort((a, b) => {
      return (
        getDistance(a.Sector, player.Sector) -
        getDistance(b.Sector, player.Sector)
      );
    })[0];

    if (getDistance(nearestTarget.Sector, player.Sector) > 4) {
      return false;
    }

    setGlobalUpdate(globalUpdate);
    return true;
  };

  return (
    <div className={classes.wrapper}>
      <Container
        className={`${classes.noMarginNoPadding} ${classes.controlClass}`}
      >
        <Row className={classes.noMarginNoPadding}>
          <Col className={classes.noMarginNoPadding}>
            <b>NAV-S</b>
            <OverlayTrigger
              placement="left"
              delay={{ show: tooltipTime, hide: 400 }}
              overlay={(props: any) => (
                <Tooltip id="button-tooltip" {...props}>
                  -5E moves ship in the sector map
                </Tooltip>
              )}
            >
              <span>
                <Arrows
                  world={world}
                  isGreen={true}
                  up={MoveDownS}
                  down={MoveUpS}
                  left={MoveLeftS}
                  right={MoveRightS}
                  disabled={
                    player.Energy < 5 || player.CanMoveSectors === false
                  }
                />
              </span>
            </OverlayTrigger>
            <Container className={`${classes.downScale} ${classes.marginTop}`}>
              <Row>
                <Col>
                  {" "}
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: tooltipTime, hide: 400 }}
                    overlay={(props: any) => (
                      <Tooltip id="button-tooltip" {...props}>
                        long range scan checks nearby sectors for enemies but
                        reveals your position
                      </Tooltip>
                    )}
                  >
                    <Button
                      onClick={() => {
                        world.GetPlayer().LongRangeScanDate =
                          world.Stardate + 1;
                        world
                          .GetPlayer()
                          .ShipLog.push(
                            "[SCAN] - Ship conducted long-range scan."
                          );
                        world.Update();
                      }}
                      disabled={player.CanLRS === false}
                      className={`${classes.longRangeScan}`}
                    >
                      L.R.S.
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col>
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: tooltipTime, hide: 400 }}
                    overlay={(props: any) => (
                      <Tooltip id="button-tooltip" {...props}>
                        checks this sector for enemies and torpedoes but reveals
                        your position
                      </Tooltip>
                    )}
                  >
                    <Button
                      onClick={() => {
                        world.GetPlayer().ShortRangeScanDate =
                          world.Stardate + 1;
                        world
                          .GetPlayer()
                          .ShipLog.push(
                            "[SCAN] - Ship conducted short-range scan."
                          );
                        world.Update();
                      }}
                      disabled={player.CanSRS === false}
                    >
                      Scan
                    </Button>
                  </OverlayTrigger>
                </Col>
              </Row>
              <Row>
                <Col>
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: tooltipTime, hide: 400 }}
                    overlay={(props: any) => (
                      <Tooltip id="button-tooltip" {...props}>
                        +10E and low chance of detection
                      </Tooltip>
                    )}
                  >
                    <Button
                      className={`${classes.marginTop}`}
                      onClick={() => {
                        player.ShipLog.push(
                          "[WAIT] - Rigging for silent running captain."
                        );
                        world.Update();
                      }}
                    >
                      WAIT
                    </Button>
                  </OverlayTrigger>
                </Col>
              </Row>
            </Container>
          </Col>
          <Col className={classes.noMarginNoPadding}>
            <Form>
              <Form.Group
                className={`mb-3 ${classes.torpText} ${classes.myButton}`}
              >
                <Form.Label>TORPEDO FIRING ANGLE </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  step={5}
                  onChange={(e: any) => {
                    let valueFiltered = Math.abs(e.target.value % 360);
                    if (valueFiltered === 0) {
                      valueFiltered = 360;
                    }
                    setDegress(valueFiltered);
                  }}
                  value={degrees}
                  disabled={player.CanFireTorpedoes === false}
                />
              </Form.Group>
              <img
                className={classes.arrowContainer}
                src={angleImage}
                alt="a unit circle image"
                style={{ rotate: `z ${displayDegrees}deg` }}
              />
            </Form>
            <OverlayTrigger
              placement="top"
              delay={{ show: tooltipTime, hide: 400 }}
              overlay={(props: any) => (
                <Tooltip id="button-tooltip" {...props}>
                  fires a torpedo in the direction of the white arrow torpedoes
                  can be dodged but guarantee a kill if they hit an enemy
                </Tooltip>
              )}
            >
              <Button
                disabled={
                  player.Torpedoes <= 0 || player.CanFireTorpedoes === false
                }
                className={`${classes.red} ${classes.myButton}  ${classes.torpButton}`}
                onClick={() => {
                  let torpedo = fireTorpedo(world.GetPlayer(), degrees || 0);
                  player.Torpedoes -= 1;
                  setWorld({
                    ...world,
                    GameObjects: [...world.GameObjects].concat(torpedo),
                  });
                  setWorldNeedsUpdate(true);
                }}
              >
                <b>FIRE TORPEDO</b>
              </Button>
            </OverlayTrigger>
            {inLaserRange() && (
              <OverlayTrigger
                placement="top"
                delay={{ show: tooltipTime, hide: 400 }}
                overlay={(props: any) => (
                  <Tooltip id="button-tooltip" {...props}>
                    costs 150E and has a chance to disable or destroy an enemy
                    ship lasers do not need to be aimed unlike torpedoes
                  </Tooltip>
                )}
              >
                <Button
                  className={`tertiaryBackground ${classes.myButton} ${classes.laserButton}`}
                  onClick={() => {
                    let targets = world.GameObjects.filter(
                      (x) =>
                        x.Quadrant &&
                        equalVectors(x.Quadrant, player.Quadrant) &&
                        x.Team != player.Team &&
                        x.Type === "Starship"
                    );

                    if (targets.length === 0) {
                      player.ShipLog.push("[ERR] - No targets in range sir!");
                      setGlobalUpdate(globalUpdate);
                      return;
                    }

                    // Note distance to PLAYER
                    let nearestTarget = targets.sort((a, b) => {
                      return (
                        getDistance(a.Sector, player.Sector) -
                        getDistance(b.Sector, player.Sector)
                      );
                    })[0];

                    if (getDistance(nearestTarget.Sector, player.Sector) > 4) {
                      player.ShipLog.push(
                        "Nearest target is out of range sir."
                      );
                      setGlobalUpdate(globalUpdate);
                      return;
                    }

                    nearestTarget.TakeDamage(player, world);

                    player.Energy -= 150;

                    world.Update();
                  }}
                  disabled={
                    player.CanFireLasers === false ||
                    player.Energy < 150 ||
                    !inLaserRange()
                  }
                >
                  <b>LASER BURST</b>
                </Button>
              </OverlayTrigger>
            )}
          </Col>
          <Col className={classes.noMarginNoPadding}>
            <b>NAV-Q</b>
            <OverlayTrigger
              placement="right"
              delay={{ show: tooltipTime, hide: 400 }}
              overlay={(props: any) => (
                <Tooltip id="button-tooltip" {...props}>
                  -100E warps ship to a new quadrant position
                </Tooltip>
              )}
            >
              <span>
                <Arrows
                  world={world}
                  isPurple={true}
                  up={MoveDownQ}
                  down={MoveUpQ}
                  left={MoveLeftQ}
                  right={MoveRightQ}
                  disabled={
                    player.Energy < 100 || player.CanMoveQuadrants === false
                  }
                />
              </span>
            </OverlayTrigger>
            <div className={classes.marginTop} />
            <OverlayTrigger
              placement="right"
              delay={{ show: tooltipTime, hide: 400 }}
              overlay={(props: any) => (
                <Tooltip id="button-tooltip" {...props}>
                  shields provide some protection against lasers but do nothing
                  against torpedoes
                </Tooltip>
              )}
            >
              <Button
                className={`${player.ShieldsUp ? "color3" : "color1"} ${
                  classes.myButton
                } ${classes.downScale}`}
                onClick={() => {
                  player.ShieldsUp = !player.ShieldsUp;
                  player.Condition = ShipStatuses.Red;
                  setWorld({ ...world });
                }}
              >
                {player.ShieldsUp ? "Lower Shields" : "Raise Shields"}
              </Button>
            </OverlayTrigger>
          </Col>
        </Row>
        <Row className={classes.noMarginNoPadding}>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}></Col>
        </Row>
        <Row className={classes.noMarginNoPadding}>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}></Col>
        </Row>
      </Container>
    </div>
  );
}
