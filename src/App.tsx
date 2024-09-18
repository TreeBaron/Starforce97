import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Starship, World } from "./TypeDefinitions";
import { Commands } from "./Components/Commands/Commands";
import { getWorld } from "./Factory";
import "./App.css";
import { StarshipDisplay } from "./Components/StarshipDisplay/StarshipDisplay";
import "bootstrap/dist/css/bootstrap.min.css";
import { MapDisplay } from "./Components/MapDisplay/MapDisplay";
import { ShipLog } from "./Components/ShipsLog/ShipsLog";
import { RadarLog } from "./Components/RadarLog/RadarLog";
import playershipexploding from "./assets/playershipexploding.gif";
import victoryImage from "./assets/victoryimage.jpeg";

function App() {
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [world, setWorld] = useState<World | null>(null);
  const [globalUpdate, setGlobalUpdate] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  if (world?.GetPlayer().IsDead) {
    return (
      <div className="rowS blackBackground">
        <div className="colS blackBackground" />
        <div className="colS blackBackground">
          <img src={playershipexploding} className="shipExploding" />
          <ShipLog
            world={world}
            globalUpdate={globalUpdate}
            setGlobalUpdate={setGlobalUpdate}
          />
          <p>Refresh the page to play again.</p>
        </div>
        <div className="colS" />
      </div>
    );
  }

  if (world?.GameWon) {
    return (
      <div className="titleScreen">
        <h1 className="victoryHeading mainTitleText">VICTORY</h1>
        <img src={victoryImage} className="victoryImage" />
        <div className="victoryShipLog">
          The Kron fleet has been destroyed, and desperately needed relief
          brought to our colony worlds. The Nautilus will visit Earth for
          repairs and a warm welcome home then report back to the Kron home
          world. It seems they want to make peace now that they have decoded our
          transmissions about the destruction of their fleet and the mysterious
          signal. Well done captain, or perhaps it's not too soon to say
          Admiral.
        </div>
      </div>
    );
  }

  const helpModal = () => {
    return (
      <div className="helpModal">
        <Modal
          size="xl"
          show={showHelpModal}
          onHide={() => {
            setShowHelpModal(false);
          }}
          className={`color2`}
        >
          <Modal.Header closeButton className="primaryBackground color1">
            <Modal.Title>HELP</Modal.Title>
          </Modal.Header>
          <Modal.Body className="primaryBackground color1">
            <h3>Map Key</h3>
            <ul>
              <li>|P| - Your ship.</li>
              <li>
                K10 - Enemy ship, they start at K10 and can go up-to K28
                depending on your difficulty setting.
              </li>
              <li>
                O - Planet, all planets are friendly to you and can provide
                energy.
              </li>
              <li>(+) - Planet needing supplies.</li>
              <li>!T! - Enemy torpedo, don't get hit!</li>
              <li>(T) - Your torpedo, it cannot hit you.</li>

              <li> . - Empty Space</li>
            </ul>
            <h3>Sensors</h3>
            <ul>
              <li>
                It is very important to understand that stealth is an element in
                this game.
              </li>
              <li>
                Sometimes you can see an enemy but they cannot see you.
                Sometimes an enemy can see you but you cannot see them.
              </li>
              <li>
                There is always a random chance that an enemy can see you even
                if you are 'hiding' from them. You will notice as you move
                enemies appear and disappear all over your map. This is your
                passive detection picking up on their presence.
              </li>
              <li>
                LRS - Long Range Scans cost no energy but may alert enemies in
                nearby sectors of your presence.
              </li>
              <li>
                SRS - Short Range Scans also cost no energy but may alert
                enemies in the sector you are in that you are there.
              </li>
            </ul>
            <h3>Movement</h3>
            <ul>
              <li>
                There are two types of movement, sector and quadrant movement
                and a map for each.
              </li>
              <li>
                A quadrant is made of different sectors, and moving past the
                edge of a sector will take you to a new quadrant.
              </li>
              <li>
                Quadrant movement lets you move faster, but it costs more energy
                and can cause you to jump onto or next to an enemy so it is
                slightly risky.
              </li>
              <li>
                The quadrant map wraps kind of like pac-man. So if you exit one
                side you will appear on the other side.
              </li>
            </ul>
            <h3>Energy</h3>
            <ul>
              <li>Some actions cost energy, some do not.</li>
              <li>
                Waiting with your shields down will recharge your batteries.
              </li>
              <li>Waiting at a planet will recharge your batteries faster.</li>
            </ul>
            <h3>Combat</h3>
            <ul>
              <li>Your ship can use lasers or torpedoes to attack enemies.</li>
              <li>
                Torpedoes take no energy to use, but you have a limited amount.
                There is no way to gain more torpedoes once they are gone they
                are gone.
              </li>
              <li>
                Torpedoes will always instantly kill you if they hit you. You
                will passively detect torpedoes once they get close to you so
                you have a chance to dodge if you know what direction they are
                going.
              </li>
              <li>
                Lasers cost energy but can be used indefinitely. They require
                getting close to a target however and if you are in laser range
                the enemy can detect you.
              </li>
              <li>
                Lasers will not immediately kill you if your shields are up,
                however they can trigger a fire which might kill you later on.
              </li>
              <li>
                Lasers can knock out random ship systems, so they might cripple
                your ability to move or fire torpedoes among other things.
              </li>
              <li>Repairing damage is random and will happen over time.</li>
            </ul>
          </Modal.Body>
        </Modal>
      </div>
    );
  };

  return (
    <div className={`${!showConsole ? "titleScreen" : "primaryBackground"}`}>
      <div className="hiddenImages">
        {world &&
          world.CachedImagePaths.map((imagePath) => <img src={imagePath} />)}
      </div>
      {!showConsole ? <h1 className="mainTitleText ">STARFORCE 97</h1> : <></>}
      {!showConsole ? (
        <>
          <div className="rowS">
            <Button
              variant="dark"
              className="secondaryBackground launchButton smallPadding"
              onClick={() => {
                let localWorld = getWorld(setWorld, 1);
                setWorld(localWorld);
                setGlobalUpdate(!globalUpdate);
                localWorld.GetPlayer().Torpedoes = 25;
                setShowConsole(true);
              }}
            >
              CADET
            </Button>
            <Button
              variant="dark"
              className="secondaryBackground launchButton smallPadding"
              onClick={() => {
                let localWorld = getWorld(setWorld, 2);
                setWorld(localWorld);
                setGlobalUpdate(!globalUpdate);
                localWorld.GetPlayer().Torpedoes = 15;
                setShowConsole(true);
              }}
            >
              CAPTAIN
            </Button>
            <Button
              variant="dark"
              className="secondaryBackground launchButton smallPadding"
              onClick={() => {
                let localWorld = getWorld(setWorld, 3);
                setWorld(localWorld);
                setGlobalUpdate(!globalUpdate);
                localWorld.GetPlayer().Torpedoes = 10;
                setShowConsole(true);
              }}
            >
              ADMIRAL
            </Button>
          </div>
          <div className="helpButton">
            <Button
              variant="dark"
              className="tertiaryBackground smallPadding smallButton"
              onClick={() => {
                setShowHelpModal(true);
              }}
            >
              HELP
            </Button>
            <Button
              variant="dark"
              className="tertiaryBackground smallPadding smallButton"
              onClick={() => {
                setShowAboutModal(true);
              }}
            >
              ABOUT
            </Button>
          </div>
          {helpModal()}
          <Modal
            size="lg"
            show={showAboutModal}
            onHide={() => {
              setShowAboutModal(false);
            }}
            className={`color2`}
          >
            <Modal.Header closeButton className="primaryBackground color1">
              <Modal.Title>About</Modal.Title>
            </Modal.Header>
            <Modal.Body className="primaryBackground color1">
              <p>About the Game</p>
              <p>
                Inspired by Super Star Trek and other retro text-adventure,
                games Starforce 97 is my own personal flavor of a turn-based
                space strategy game. In many ways it is a proof-of-concept since
                it's the first game I've ever created that can be played in a
                browser.
              </p>
              <p>About the Author</p>
              <p>
                Hi! My name is John Dodd. I'm a software engineer who loves
                science fiction and writing software in my free-time.
              </p>
              <p>
                If you're interested in my other projects you can check out my
                website <a href="https://johntravisdodd.wordpress.com">here</a>.
                One of the cool projects you can find there is my random planet
                generator which was used to make the planets in this game. It's
                totally free to use and I think the source code is also floating
                around somewhere if you want to take a look at it.
              </p>
              <p>Special Thanks</p>
              <p>
                I just want to give a shoutout to MillionthVector and his
                website <a href="https://millionthvector.blogspot.com/">here</a>
                . I've used his sprites in tons of my games and several of them
                were used in this one for the ship animations.
              </p>
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <>
          <div className="rowS blackBackground">
            <div className="colS">
              <MapDisplay
                displayQuadrant={false}
                displaySector={true}
                world={world || ({} as World)}
                globalUpdate={globalUpdate}
                setGlobalUpdate={setGlobalUpdate}
              />
              <ShipLog
                world={world || ({} as World)}
                globalUpdate={globalUpdate}
                setGlobalUpdate={setGlobalUpdate}
              />
            </div>
            <div className="colS">
              <StarshipDisplay
                starship={world?.GetPlayer() || ({} as Starship)}
                world={world || ({} as World)}
                globalUpdate={globalUpdate}
                setGlobalUpdate={setGlobalUpdate}
                children={
                  <Commands
                    world={world || ({} as World)}
                    setWorld={setWorld}
                    globalUpdate={globalUpdate}
                    setGlobalUpdate={setGlobalUpdate}
                  />
                }
              />
            </div>
            <div className="colS">
              <MapDisplay
                displayQuadrant={true}
                displaySector={false}
                world={world || ({} as World)}
                globalUpdate={globalUpdate}
                setGlobalUpdate={setGlobalUpdate}
              />
              <RadarLog
                world={world || ({} as World)}
                globalUpdate={globalUpdate}
                setGlobalUpdate={setGlobalUpdate}
              />
            </div>
          </div>
          <Button
            variant="dark"
            className="secondaryBackground smallPadding smallButton helpButtonInGame"
            onClick={() => {
              setShowHelpModal(true);
            }}
          >
            HELP
          </Button>
          {helpModal()}
          <div className="globalUpdate">{globalUpdate}</div>
        </>
      )}
    </div>
  );
}

export default App;
