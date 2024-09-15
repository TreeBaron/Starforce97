import { useState } from "react";
import { ShipStatuses } from "../../TypeDefinitions";
import { Starship } from "../../TypeDefinitions";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import backgroundImage from "../../assets/starbackground.png";
import starfieldImage from "../../assets/starfield.gif";
import orphanImage from "../../assets/happyorphans.jpeg";
import { World } from "../../TypeDefinitions";
import classes from "./StarshipDisplay.module.css";
import { equalVectors } from "../../Factory";

export interface DamageDisplayProps {
  starship: Starship;
  world: World;
  children: any;
  setPlayer: (player: Starship) => void;
}

export interface ConditionProps {
  condition: string;
}
const Condition = ({ condition }: ConditionProps) => {
  if (condition == ShipStatuses.Green) {
    return <span className={classes.green}>GREEN</span>;
  } else if (condition === ShipStatuses.Yellow) {
    return <span className={classes.yellow}>YELLOW</span>;
  }

  return <span className={classes.red}>RED</span>;
};

export function StarshipDisplay({
  starship,
  world,
  setPlayer,
  children,
}: DamageDisplayProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const player = world.GetPlayer();
  if (player === null) return;

  let planet = world.GameObjects.find(
    (x: any) =>
      x.Type === "Planet" &&
      equalVectors(x.Sector, player.Sector) &&
      equalVectors(x.Quadrant, player.Quadrant)
  );

  // mysterious signal related stuff
  if (planet && planet.NeedsDiscovery) {
    planet.NeedsDiscovery = false;
    player.ShipLog.push(`\n` + planet.DiscoveryText);
    player.ShipLog.push(
      "\n[DISCOVERY] - We have noted this place in our charts and submitted our scans to HQ."
    );
    setPlayer(player);
  }

  return (
    <div className="secondaryBackground">
      <div className={classes.imageClass}>
        {planet && (
          <>
            <img className={classes.overlayImage} src={backgroundImage} />
            <img className={classes.overlayImagePlanet} src={planet.Image} />
            {planet?.Description && (
              <>
                <div
                  className={`${classes.descriptionCard} primaryBackground`}
                />
                <div className={`${classes.description} color1`}>
                  {planet.Description}
                </div>
                {planet.NeedsRelief === true &&
                  planet.ReceivedRelief === false && (
                    <>
                      <Button
                        className={`${classes.deliverAidButton} color1`}
                        onClick={() => {
                          setShowModal(true);
                        }}
                      >
                        Deliver Supplies
                      </Button>
                      <Modal
                        size="sm"
                        show={showModal}
                        onHide={() => {
                          setShowModal(false);
                          player.ShipLog.push(
                            `[MISSION] - Delivered supplies to ${planet.Detail}.`
                          );
                          setPlayer({ ...player });
                          planet.ReceivedRelief = true;
                          planet.Name = " O ";
                        }}
                        className={`color2 ${classes.modal}`}
                      >
                        <Modal.Header closeButton className="primaryBackground">
                          <Modal.Title>Supplies Delivered</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="primaryBackground">
                          <img
                            className={classes.warOrphans}
                            src={orphanImage}
                          />
                        </Modal.Body>
                      </Modal>
                    </>
                  )}
              </>
            )}
            <div className={`${classes.blinkingBoxWhite} color2`}>TRAK</div>
            <div className={`${classes.blinkingBoxRed} color1`}>DATA</div>
            <div className={`${classes.blinkingBoxBlue} color3`}>DSK</div>
            <h3
              className={`${classes.overlayImage} color1 ${classes.coolFont}`}
            >
              {planet.Detail.toUpperCase()}
            </h3>
          </>
        )}
        {!planet && (
          <>
            <img
              className={classes.overlayImage}
              src={player.DisplayScreen ? player.DisplayScreen : starfieldImage}
            />
          </>
        )}
      </div>
      {children}
      <div className={`secondaryBackground ${classes.shipDisplay}`}>
        <Container>
          <Row>
            <Col className={classes.myColumn}>CONDITION</Col>
            <Col className={classes.myColumn}>
              <Condition condition={starship.Condition} />
            </Col>
          </Row>
          <Row>
            <Col className={classes.myColumn}>ENERGY</Col>
            <Col className={classes.myColumn}>{starship.Energy}</Col>
          </Row>
          <Row>
            <Col className={classes.myColumn}>TORPEDOES</Col>
            <Col className={classes.myColumn}>{starship.Torpedoes}</Col>
          </Row>
          <Row>
            <Col className={classes.myColumn}>SHIELDS</Col>
            <Col className={classes.myColumn}>
              {starship.ShieldsUp ? "RAISED (-25E)" : "LOWERED"}
            </Col>
          </Row>
        </Container>
      </div>
      <div className={classes.marginBottom} />
    </div>
  );
}
