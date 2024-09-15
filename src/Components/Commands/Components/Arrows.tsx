import { Button, Col, Row, Container } from "react-bootstrap";
import { World } from "../../../TypeDefinitions";
import classes from "./Arrows.module.css";

export interface ArrowsProps {
  world: World;
  isPurple?: boolean;
  isGreen?: boolean;
  isRed?: boolean;
  disabled: boolean;
  up: () => void;
  down: () => void;
  left: () => void;
  right: () => void;
}

export function Arrows({
  isPurple = false,
  isGreen = false,
  isRed = false,
  up,
  down,
  left,
  right,
  disabled,
}: ArrowsProps) {
  let colorClass = classes.blue;

  if (isPurple) {
    colorClass = classes.purple;
  } else if (isGreen) {
    colorClass = classes.green;
  } else if (isRed) {
    colorClass = classes.red;
  }

  return (
    <div className={classes.wrapper}>
      <Container className={classes.noMarginNoPadding}>
        <Row className={classes.noMarginNoPadding}>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}>
            <Button
              disabled={disabled}
              className={`${colorClass} ${classes.myButton}`}
              onClick={up}
            >
              {" "}
              ▲
            </Button>
          </Col>
          <Col className={classes.noMarginNoPadding}></Col>
        </Row>
        <Row className={classes.noMarginNoPadding}>
          <Col className={classes.noMarginNoPadding}>
            <Button
              disabled={disabled}
              className={`${colorClass} ${classes.myButton}`}
              onClick={left}
            >
              {" "}
              ◄
            </Button>
          </Col>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}>
            <Button
              disabled={disabled}
              className={`${colorClass} ${classes.myButton}`}
              onClick={right}
            >
              {" "}
              ►
            </Button>
          </Col>
        </Row>
        <Row className={classes.noMarginNoPadding}>
          <Col className={classes.noMarginNoPadding}></Col>
          <Col className={classes.noMarginNoPadding}>
            <Button
              disabled={disabled}
              className={`${colorClass} ${classes.myButton}`}
              onClick={down}
            >
              {" "}
              ▼
            </Button>
          </Col>
          <Col className={classes.noMarginNoPadding}></Col>
        </Row>
      </Container>
    </div>
  );
}
