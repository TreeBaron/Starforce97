import { useEffect, useState } from "react";
import { World, Starship } from "../../TypeDefinitions";
import classes from "./ShipsLog.module.css";

export interface ShipLogProps {
  world: World;
  player: Starship | null;
}

export function ShipLog({ world, player }: ShipLogProps) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (player != null) {
      let shipLog = player.ShipLog.join("\n ");
      setText(shipLog + "\n\n");
    }
  }, [world, player]);

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
