import { useEffect, useState } from "react";
import { World } from "../../TypeDefinitions";
import classes from "./RadarLog.module.css";

export interface RadarLogProps {
  world: World;
}

export function RadarLog({ world }: RadarLogProps) {
  let playerShip = world.GetPlayer();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    let radarLog = playerShip.RadarLog.join(" \n");
    setText(radarLog + "\n\n");
  }, [world]);

  useEffect(() => {
    let textAreaVar = document.getElementById("radartextarea_id");
    if (textAreaVar) {
      textAreaVar.scrollTop = textAreaVar.scrollHeight;
    }
  }, [text, setText]);

  return (
    <textarea
      id={"radartextarea_id"}
      value={text}
      readOnly={true}
      className={`${classes.textClass} color3`}
    />
  );
}
