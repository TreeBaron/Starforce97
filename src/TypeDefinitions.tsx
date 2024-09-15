export type Starship = {
  DisplayScreen?: string | null;
  ShipLog: string[];
  RadarLog: string[];
  IsPlayer: boolean;
  IsDead: boolean;
  Team: string;
  Name: string;
  Type: string;
  Condition: string;
  Quadrant: Vector2;
  Sector: Vector2;
  Torpedoes: number;
  Energy: number;
  ShieldsUp: boolean;
  LongRangeScanDate: number;
  ShortRangeScanDate: number;
  CanMoveQuadrants: boolean;
  CanMoveSectors: boolean;
  CanLRS: boolean;
  CanSRS: boolean;
  CanFireTorpedoes: boolean;
  CanFireLasers: boolean;
  Update: (this: Starship, world: World) => void;
  TakeDamage: (this: Starship, damageDealer: Starship) => void;
  AIData?: any;
  CanDetectShip: (
    this: Starship,
    enemyShip: Starship,
    world: World,
    isQuadrant: boolean
  ) => boolean;
};

export type Vector2 = {
  X: number;
  Y: number;
};

export type Quadrant = {
  Dimensions: Vector2;
  Sectors: Sector[];
};

export type Sector = {
  Dimensions: Vector2;
  Map: any[][];
};

export type World = {
  ClearDisplayScreen: boolean;
  GameObjects: any[];
  Stardate: number;
  GameWon: boolean;
  GetPlayer: (this: World) => Starship;
  Update: (this: World) => void;
  SetWorld: (world: World) => void;
  CachedImagePaths: string[];
};

export type Planet = {
  Sector: Vector2;
  Quadrant: Vector2;
  Image: null | string;
  Name: null | string;
  Detail: string;
  Description?: string | null;
  DiscoveryText?: string;
  CanRefuel: boolean;
  Type: string;
  IsDead: boolean;
  NeedsRelief: boolean;
  ReceivedRelief: boolean;
  NeedsDiscovery?: boolean;
};

export type Torpedo = {
  Sector: Vector2;
  ActualPosition: Vector2;
  Quadrant: Vector2;
  Velocity: Vector2;
  IsDead: boolean;
  Name: string;
  Team: string;
  Type: string;
  Update: (this: Torpedo, world: World) => void;
};

export const ShipStatuses = {
  Red: "RED",
  Yellow: "YELLOW",
  Green: "GREEN",
};

export const Teams = {
  Coalition: "COALITION",
  Kron: "KRON",
};

export const CoalitionShipAscii = `                               ^^^^^                                                              
                               ^   ^^^^^                                                          
                               ^       ^^^^^                                                      
  ^^^^^^^^^^^                  ^           ^^^^^                                                  
 ^^         ^^                 ^^              ^^^^^^                                             
 ^            ^^                ^^                  ^^^^^                                         
^^              ^^^              ^      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                             
^                 ^^^          ^^^^^^^^^                             ^^^^^^^                      
^                  ^^^^^^^^^^^^^                           ^^^^^^^^^^  ^^^^^^^^^^                 
^      ^^^^^^^^^^^^^^^                     ^^^^^             ^^^^^^^^^           ^^^^^^           
^^ ^^^^^^^^^^^^                                                ^^^^^^^^^^^^^^^^^^^^   ^^^^^       
 ^^^^                                                                                     ^^^^^   
    ^^^                        ^                                                              ^^^^
      ^^^^^                                                                 ^^^^^             ^^^^
          ^^^^                                   ^^^^ ^^^                                   ^^^   
              ^^^^^^                                                                      ^^^     
              ^^^  ^^^^^^^^^                                                          ^^^^^       
           ^^^        ^^^^^^^^^^                           ^^ ^^^^                ^^^^^ ^^^       
         ^^^     ^^^ ^^^      ^^^^^^^                                        ^^^^^     ^^         
     ^^^^  ^^^^^^^     ^     ^      ^^^^^^^                          ^^^^^^^^^        ^^          
  ^^^^^^^^^^            ^  ^^              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^           
 ^^^^                    ^^^                                ^^              ^^^^                  
                         ^                                ^^^           ^^^^^                     
                                                         ^^         ^^^^                          
                                                          ^^   ^^^^^                              
                                                           ^^^^^`;

export const KillonShipAscii = `        ^^^^^   ^^^                                                     
       ^^   ^  ^^ ^^^                                                   
     ^^    ^^  ^     ^^^                                                
   ^^^    ^^   ^        ^^^^       ^^^^^^^^^^^^^                        
  ^^     ^^   ^            ^^^^^^^^            ^^^^^^^^^                
 ^^^^^^^^    ^^        ^^^^^                           ^^^^^            
           ^^^    ^^^^^                          ^^^^^^    ^^^^^        
^^^      ^^^   ^^^^          ^^^^^^^^^^^^       ^^^^^^^^^^^    ^^^^     
^^^^^^^^^^^^^^^^       ^^^^^^^           ^^^^                     ^^^^  
 ^^^^               ^^^                      ^^^^     ^^^^^     ^^   ^^^
    ^^^^         ^^^^                           ^^^                   ^^
        ^^^^      ^^^^^                       ^^^^                  ^^  
           ^^^^^      ^^^^^^^^        ^^^^^^^^       ^^^^        ^^^    
               ^^^^^          ^^^^^^^^                        ^^^^      
                   ^^^^^                                 ^^^^^          
                        ^^^^^                       ^^^^^               
                             ^^^^^^^^^^^^^^^^^^^^^^^^                   `;

export const PlanetAscii = `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@####%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@@@@@@@@------------@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@@@@=---------------@@@@@@@:-@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@@-*-------@@@=-----%@@@@@@--@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@-@@@@@@#--@@@@%------%*@@@%--@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@%%@@@@@@@+@@@@@@@-----@@@-@--@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@=---%@@@@@@@@@@@@@@@=*---@@@@@#@@#@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@-----%@@@@@=@@--+@@@@@@@*%--=------@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@*-----@@@@@@@@+----@@@@@@@@@@@=------%@@@@@@@+=@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@---::--@@@@@@@@-----@@@@@@@@@@@@@#-----@@@@@@@@*-@@@@@@@@@@@@@
                             @@@@@@@@@@@@*:-::::::@@@@@@@-----@@@@@@@@@@@@@@+-----%@@@@@@@--@@@@@@@@@@@@
                             @@@@@@@@@@@**-:-::--*:==-@@@@@@+#@@@@@@@@@@@@@@@----%@@@@@@@@--=@@@@@@@@@@@
                             @@@@@@@@@@-:*-:::::**-+--@@@@@@@@@@@@@@@@@@@@@@%---@@@@@@@@@@@@--@@@@@@@@@@
                             @@@@@@@@@--.--:::::*****=@@@@@@@@@@@@@@@@@@@@@@#---@@@@@@@@@@@#---@@@@@@@@@
                             @@@@@@@@*...=::::::**+..*-@@@@@@@@@@@@@@@@@@@@@---=#@@@@@@@@@@-----@@@@@@@@
                             @@@@@@@@+...+::::-::*-..:-::@@@@@@@@@--@@@@@@@-----@@@@@@@---------@@@@@@@@
                             @@@@@@@*-...-=****:+*+:.::---@@@@@+=@=%@@@@@@@-----@@@@@@-----------@@@@@@@
                             @@@@@@--....--*-**:**+-:::-=:@@@@-----#@@@@@@@@----@@@@--------------@@@@@@
                             @@@@@@::::...--*-***---::=*:.:+--------@@@@@@@=------@------------::-#@@@@@
                             @@@@@::.:-.--**=***=.-+.::*:-:-:-------+@@@@@@+------:-----------*:#:=@@@@@
                             @@@@@---*..--**--**:..:.:.*:::=--------*@@@@@@:----------------+%@@@@@+@@@@
                             @@@@+:---..-.-**--+-......*-+*+-:::----#@@@@@---------*@#------@@@@@@@@@@@@
                             @@@@--**.:-*.:**-........----**:--::---@*-#+----------*@*:-----@@@@@@@+*@@@
                             @@@--.-+*:.-.:*-... ....:*--*-*:::::----=:-----------%@@=:-----*@@@@@-:-@@@
                             @@@...................::*..-=-*:::::-:=:**--*--------@@@@%:-----@@@@@---@@@
                             @@:.-...............::..: ....-+:::---:=**-+@--------@@@@@@------@@@@----@@
                             @@..--..:-........:.::..:......::::-::******@--------%@@@@@+--=--@@@@+---@@
                             @@.......:...........:.........:*::-::*-::*=@-----@---@+@@@---@=-@@@@@#--@@
                             @@..-............:::.... ..  ..-*-::-***@@@@@@@--*@=#@@-:-----@@@@@@@@@@:=@
                             @................:::.. ...  ...-***-****@@@@@@@------*@@%-----@@@@@@@@@@@@@
                             @.................::..... .....-*****+:*#@@@@@@------+@@-=+@---@@@@@@@@@@@@
                             @:............... .............:******=*=@@@@@@---+@@@@=-@@---=@@@@@@@@@@@@
                             @--................  .-...:-....-*****-+@@@@@@@---@@@@@%+%@--:%@@@@@@@@@@@@
                             @::........................:...:*---**:@@@@@@@@--@@@-@@@@@----*@@@@@@@@@@@@
                             *::.....--................::....:..-+=@@@@@@@@@@@*@@@@@@@@---+@@+@@@@@@@--%
                             *::.--.-*---...-=---......:.........::#=@@@@@@@@@@@@@@@@@@@@#@@+#@@@%-:---%
                             #:......--*-----:::-...............*::---@@@@@@@@@@@@@@@@@@@@@@@@@@@------%
                             *:.:::....---*=--..--... .......-=*-=:-:--#@@@@@@@@@@@@@@@@@@@@@@@#-------%
                             *:.....-:.-----....=*..........:**:-::--::#@@@@@@@@@@@@@@@@@@@@=----------%
                             *.....:-.---.......=*:.........*=@-::--::--@@@@@@@@@@@@@@@@@@@------------%
                             *.....-.......................-*--*+---:---@@@@@@@@@@@@@@@@@@@@-----------%
                             @.....::........... .........:-+@@--:*:--:.@@@@-*@@@@@@@@@#@@@@@@---------%
                             @.....::.::......-. ..... ...:-@@-=*-+--@@@=+@--..:@@@@@@--@@@@@@@--+----%@
                             @.:...:..........- .........:-@:--::.--*-+@@---------@@@@-+@@@@@@@*------=@
                             @..........................::.%::-::.@=-*-@@--------#@@@*--+%@@@@@%%------@
                             @............ .............-*-:%--:-::--*=@@#-------#=*--:---%@@@@@-------@
                             @=......... ........ .+-...**@-%*---::-***@@@-------*-------*@@@@@@----@@:@
                             @@....................----=**-+#@=-:--*++-:%=-:-#-**#:@------+@@@@@@---#-@@
                             @@............. ......--*-**::::@@-::***=@-@---=@@@@@@:@=-----@@@@@@@@@%%@@
                             @@:....................-*++:---:%=-:****#@@+--@@@@@@@@+@@--#@@@@@@@@@@@@@@@
                             @@@.............-......-*:---:-%@:*@:-:-@@::**@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@..:.......-.........=+:---:-@@@+@@@=*@@-::-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@*.:.:..............:::-::--@@@+@@@=*@@-::-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@.:.......-:.......**:----:#@@@@@@@@@#::::%@=@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@-......:.........*=:-:----:@@@@@@@@@#:::::**-@@@---@@@@@@@@@@@@@@@@@@@@
                             @@@@@................*::::-----@@@@@@@@@=-----:+=@@----:@@+@@@@@@@@@@@@@@@@
                             @@@@@%..:.-..........*::-:------@@@@@@@@=--------@%@=---@@@@@@@---+@@@@@@@@
                             @@@@@@....-......-...*:-:------*@%%@@@@@@+-----@@@:*----%%@@%------+@@@@@@@
                             @@@@@@@..:--....---..+--:----------=@@@@@@*---=@@=--------#@@-------@@@@@@@
                             @@@@@@@@.--*.........**-:-----------@@@@@@@=--@@@@#-=------@@=-----=@@@@@@@
                             @@@@@@@@=****........***------------@@@@@@@*@@@@:@@#@--#------*----@@@@@@@@
                             @@@@@@@@@****........**:=%--@=------*@@@@@@@@@@@-@@@@=:@@--##==@--@@@@@@@@@
                             @@@@@@@@@@**=..-....:*=-*@:#@@=-----*@@@@@@@@@@@@@@@@@@@@=@@@@@@-@@@@@@@@@@
                             @@@@@@@@@@@**.......-***=@#@@@@@##*--@@@@@@@@@@@@@@@@@@@--@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@*-.......***=%@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@-=@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@*.......**-*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@--%@@=@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@.......:*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%+---@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@......+-@@@@@@@@@@@@@@@@-@@@@@@@@@@@@@@*@@-=@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@:.:..::@@@@@@@@@@@@@@@@%+:@@@@@@@@@@@@#--@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@*.:.:=*@@@@@@@@@@@@@@:%@@@@@@@@@@@@@@#:@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@=:::=::%@@@@@@@@@@@-+@@@@@@@@@@@@@:@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@*--+=*@@@@@@@@@@@@#@@@-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@@@@***:@@@@@@@@@@==@@:@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@@@@@@@#-@@@@@@@@@@@@-:@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`;
