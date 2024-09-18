import { useEffect, useState } from "react";
import { World, Starship } from "../../TypeDefinitions";
import classes from "./ShipsLog.module.css";

export interface ShipLogProps {
  world: World;
  globalUpdate: boolean;
  setGlobalUpdate: (value: boolean) => void;
}

export function ShipLog({
  world,
  globalUpdate,
  setGlobalUpdate,
}: ShipLogProps) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    let player = world.GetPlayer();
    let shipLog = player.ShipLog.join("\n ");
    setText(shipLog + "\n\n");
  }, [world]);

  useEffect(() => {
    let textAreaVar = document.getElementById("textarea_id");
    if (textAreaVar) {
      textAreaVar.scrollTop = textAreaVar.scrollHeight;
    }
  }, [text, setText]);

  return (
    <textarea
      id={"textarea_id"}
      value={text}
      readOnly={true}
      className={`${classes.textClass} color2`}
    />
  );
}
