// variabile del gioco
var game;
// array contente le info su labirinto
var maze = [];
// variabili per dimensioni
var mazeWidth = 81;
var mazeHeight = 61;
// grandezza delle mattonelle in pixel
var tileSize = 10;
// contenitore degli elemnti grafici
var mazeGraphics;

//gruppo per sprites
var sprites;

// funzione che permette 
//il caricamento di alcuni elementi
// non appena si carica la pagina
window.onload = function() {
    // 	construttore di un phaser game (width, height, renderer)
    game = new Phaser.Game(810, 610, Phaser.CANVAS, "");
    // aggiunta di uno stato di gioco e suo lancio
    // ricorda di aggiungere parte sulla descrizione
    // degli stati ed conseguente prototipazione e cambio
    
     game.state.add("PlayGame",playGame);
     game.state.start("PlayGame");

}
	
var playGame = function(game){};

//in phaser ogni stato ha delle funzioni____________________________________________________________________________________________ 

playGame.prototype = {
    preload:function(){
        game.load.image('sprite', 'img/siepe.jpg');
    },
     create: function(){
        sprites = game.add.physicsGroup();
        // variabile per aggiunta di componenti grafiche
        // posizionata in 0;0 del canvas di gioco
        mazeGraphics = game.add.graphics(0, 0);
        //se si vuole cambiare colore , a causa della costruzione del del codice bisogna andare a cambiare il colore di sfondo del gioco che per default è nero
        game.stage.backgroundColor = "#a8dd99";
        // lista delle mosse effettuate
        var moves = [];
        //creazione di una matrice per il labirinto
        //con assegnazione di ogni casella ad 1
        for(var i = 0; i < mazeHeight; i ++){
            maze[i] = [];
            for(var j = 0; j < mazeWidth; j ++){
                maze[i][j] = 1;
            }
        }
        // inizializzazione della posizione di partenza
        var posX = 1;
        var posY = 1;
        // cambio dello stato della posizione di partenza a 0
        maze[posX][posY] = 0; 
        //inserimento della mossa effettuata
        // ERRORE nella scrittura il primo dovrebbe essere posX
        // in questo caso non ci sono problemi in quanto sono inizializzate ugualemnte
        moves.push(posY + posY * mazeWidth);
        //  A looped event is like a repeat event but with no limit, it will literally repeat itself forever, or until you stop it.

    //  The first parameter is how long to wait before the event fires. In this case 1 second (you could pass in 1000 as the value as well.)
    //  The next two parameters are the function to call ('updateCounter') and the context under which that will happen.
    // in questo caso 1/25 sec è l0intervallo di tempo
          game.time.events.loop(Phaser.Timer.SECOND/75, function(){
              //controllo se l'array delle mosse è vuoto
               if(moves.length){       
                    var possibleDirections = "";
                    // questi IF non sono esclusivi viene aggiunta una lettera per ogni
                    //condizione verificata
                    if(posX+3 > 0 && posX + 3 < mazeHeight - 1 && maze[posX + 3][posY] == 1){
                         possibleDirections += "S";
                    }
                    if(posX-3 > 0 && posX - 3 < mazeHeight - 1 && maze[posX - 3][posY] == 1){
                         possibleDirections += "N";
                    }
                    if(posY-3 > 0 && posY - 3 < mazeWidth - 1 && maze[posX][posY - 3] == 1){
                         possibleDirections += "W";
                    }
                    if(posY+3 > 0 && posY + 3 < mazeWidth - 1 && maze[posX][posY + 3] == 1){
                         possibleDirections += "E";
                    } 
                    //controllo che vi sia una direzione da poter intraprendere
                    if(possibleDirections){
                        // scelta randomica della direzione in base a quelle possibili
                        //con un indice che ne indica la posizione nell'array con esse creato
                         var move = game.rnd.between(0, possibleDirections.length - 1);
                         // ogni mossa va a modificare 2 mattonelle
                         // fatto la prova con una sola ma non crea un path ma un groviglio
                         switch (possibleDirections[move]){
                              case "N": 
                                   maze[posX - 2][posY] = 0;maze[posX - 3][posY] = 0;
                                   maze[posX - 1][posY] = 0;
                                   posX -= 3;
                                   break;
                              case "S":
                                   maze[posX + 2][posY] = 0;maze[posX +3][posY] = 0;
                                   maze[posX + 1][posY] = 0;
                                   posX += 3;
                                   break;
                              case "W":
                                   maze[posX][posY - 3] = 0;
                                   maze[posX][posY - 2] = 0;
                                   maze[posX][posY - 1] = 0;
                                   posY -= 3;
                                   break;
                              case "E":
                                    maze[posX][posY +3] = 0;
                                   maze[posX][posY + 2]=0;
                                   maze[posX][posY + 1]=0;
                                   posY += 3;
                                   break;         
                         }
                         //inserisco mossa 
                         moves.push(posY + posX * mazeWidth);   
                    }
                    else{
                        //recupero ultima mossa inserita e la elimino dall'elenco
                         var back = moves.pop();
                         // formula utilizzata per il calcolo di questo numero
                         // back = posY + posX * mazeWidth
                         // quindi (back+posY) / mazeWidth=  posX
                         // dove posX è il risultato e posY il resto 
                         posX = Math.floor(back / mazeWidth);
                         posY = back % mazeWidth;
                    }
                    //chiamata all funzione per disegnare le nuove caselle aggiunte
                    drawMazeSprites(posX, posY);                                         
               }      
          }, this);	  
     }
}

function drawMaze(posX, posY){
    //pulizia della variabile grafica
    //ad ogni passaggio viene demolito e ricostruito il labirinto
    mazeGraphics.clear();

    mazeGraphics.beginFill(0x004605);
    for(i = 0; i < mazeHeight; i ++){
        for(j = 0; j < mazeWidth; j ++){
            if(maze[i][j] == 1){
                mazeGraphics.drawRect(j * tileSize, i * tileSize, tileSize, tileSize);                 
            }
        }
    }
    mazeGraphics.endFill();   
    mazeGraphics.beginFill(0xff0000); 
    mazeGraphics.drawRect(posY * tileSize, posX * tileSize, tileSize, tileSize);
    mazeGraphics.endFill();   
}  

function drawMazeSprites(posX, posY){
    //pulizia della variabile grafica
    //ad ogni passaggio viene demolito e ricostruito il labirinto
    var item;
    sprites.destroy();
    mazeGraphics.clear();
    sprites = game.add.physicsGroup();
    for(i = 0; i < mazeHeight; i ++){
        for(j = 0; j < mazeWidth; j ++){
            if(maze[i][j] == 1){
                
                sprites.create(j * tileSize, i * tileSize, 'sprite');
    //mazeGraphics.drawRect(, tileSize, tileSize);                 
            }
        }
    }
    sprites.setAll('body.immovable', true);
    
    mazeGraphics.beginFill(0xff0000); 
    mazeGraphics.drawRect(posY * tileSize, posX * tileSize, tileSize, tileSize);
    mazeGraphics.endFill();   
}  