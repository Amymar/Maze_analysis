//variabile che contiene il gioco
var game;
// impostazioni di gioco
var gameOptions = {
    mazeWidth: 81,
    mazeHeight: 61,
    tileSize: 10
}

window.onload = function() {
    //variabile con attributi
    var gameConfig = {
       type: Phaser.CANVAS,
       width: gameOptions.mazeWidth * gameOptions.tileSize,
       height: gameOptions.mazeHeight * gameOptions.tileSize,
       // a differenza del precednte i colori sono stati invertiti
       // il nero rappresenta i muri e il grigio il cammino percorribile
       backgroundColor: 0xa8dd99,
       scene: [playGame]
    };
    //creazione gioco 
    game = new Phaser.Game(gameConfig);
    // serve a portare la finestra in cui è presente il gioco in primo piano rispetto alle altre in caso non lo fosse
    window.focus()
    //forza l'utilizzo di questa funzione almeno una volta
    resize();
    // rimane in attesa dell'evento per il quale chiamare la funzione definita
    window.addEventListener("resize", resize, false);
}


// si possono utilizzare 2 tecniche per la costruzione della scena
// 1) si definisce all'interno delle configurazioni le classi di creazione, render, ect
// 2) si crea una classe estensione di Scene con la definizione delle funzioni al suo interno
class playGame extends Phaser.Scene{
    //permette la costruzione della classe utilizzando il costruttore dell'antenato
    constructor(){
        super("PlayGame");
    }
    //si riporta il codice della costruzione dela labirinto 
    //facendo attenzione al cambio di alcune variabili
    //questa volta non viene mostrata l'esecuzione della costruzione ma solo il suo risultato
    //per questo la funzione draw si trova alla fine
    create(){
        this.mazeGraphics = this.add.graphics();
        var moves = [];
        this.maze = [];
        for(var i = 0; i < gameOptions.mazeHeight; i ++){
            this.maze[i] = [];
            for(var j = 0; j < gameOptions.mazeWidth; j ++){
                this.maze[i][j] = 1;
            }
        }
        var posX = 1;
        var posY = 1;
        this.maze[posX][posY] = 0;
        moves.push(posY + posY * gameOptions.mazeWidth);
        while(moves.length){
            var possibleDirections = "";
            if(posX+2 > 0 && posX + 2 < gameOptions.mazeHeight - 1 && this.maze[posX + 2][posY] == 1){
                possibleDirections += "S";
            }
            if(posX-2 > 0 && posX - 2 < gameOptions.mazeHeight - 1 && this.maze[posX - 2][posY] == 1){
                possibleDirections += "N";
            }
            if(posY-2 > 0 && posY - 2 < gameOptions.mazeWidth - 1 && this.maze[posX][posY - 2] == 1){
                possibleDirections += "W";
            }
            if(posY+2 > 0 && posY + 2 < gameOptions.mazeWidth - 1 && this.maze[posX][posY + 2] == 1){
                possibleDirections += "E";
            }
            if(possibleDirections){
                var move = Phaser.Math.Between(0, possibleDirections.length - 1);
                switch (possibleDirections[move]){
                    case "N":
                        this.maze[posX - 2][posY] = 0;
                        this.maze[posX - 1][posY] = 0;
                        posX -= 2;
                        break;
                    case "S":
                        this.maze[posX + 2][posY] = 0;
                        this.maze[posX + 1][posY] = 0;
                        posX += 2;
                        break;
                    case "W":
                        this.maze[posX][posY - 2] = 0;
                        this.maze[posX][posY - 1] = 0;
                        posY -= 2;
                        break;
                    case "E":
                        this.maze[posX][posY + 2] = 0;
                        this.maze[posX][posY + 1] = 0;
                        posY += 2;
                        break;
                }
                moves.push(posY + posX * gameOptions.mazeWidth);
            }
            else{
                var back = moves.pop();
                posX = Math.floor(back / gameOptions.mazeWidth);
                posY = back % gameOptions.mazeWidth;
            }
        }
        //mostra labirinto finito
        this.drawMaze(posX, posY);
        //permette risoluzioni dei cammini
        var easystar = new EasyStar.js();
        //necessita di matrice che indica se il passaggio è permesso in un dato punto
        easystar.setGrid(this.maze);
        //identifica con quale carattere sono state identificate le 
        easystar.setAcceptableTiles([0]);
        //permette la ricerca del cammino
        // parametri: coordinate inizio, coordiante fine, funzione di calcolo
        easystar.findPath(1, 1, gameOptions.mazeWidth - 2, gameOptions.mazeHeight - 2, function(path){
            this.drawPath(path);
        }.bind(this));
        easystar.calculate();
    }
    drawMaze(posX, posY){
        this.mazeGraphics.fillStyle(0x004605);
        for(var i = 0; i < gameOptions.mazeHeight; i ++){
            for(var j = 0; j < gameOptions.mazeWidth; j ++){
                if(this.maze[i][j] == 1){
                    this.mazeGraphics.fillRect(j * gameOptions.tileSize, i * gameOptions.tileSize, gameOptions.tileSize, gameOptions.tileSize);
                }
            }
        }
    }
    drawPath(path){
        var i = 0;
        //evento a tempo  permette di inserire le caselle bordeaux lungo il cammino
        this.time.addEvent({
            delay: 5,// se non ricordo male è in ms
            callback: function(){
                if(i < path.length){
                    this.mazeGraphics.fillStyle(0xd0673c);
                    this.mazeGraphics.fillRect(path[i].x * gameOptions.tileSize + 1, path[i].y * gameOptions.tileSize + 1, gameOptions.tileSize - 2, gameOptions.tileSize - 2);
                    i++;
                }
                else{
                    this.scene.start("PlayGame"); //permette la creazione di un nuovo labirinto e sua conseguente risoluzione
                }
            },
            callbackScope: this,
            loop: true //permette di ripetere la funzione
        });
    }
}


//permette ridimensionamento dell'oggento in base alla grandezza della finestra che si ha a disposizione
//se non si vuole implementare questo tipo di funzione nei progetti è possibile utilizzare Bootstrap 
//libreria per i cui contenitori sono già state implementate funzioni di resizing ed adattamento alla pagina
function resize() {
    //permette di recuperare un elemento tramite la sua denominazione
    var canvas = document.querySelector("canvas");
    //Ottenere l'altezza e la larghezza del frame corrente
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    //calcolo del rapporto d'immagine o aspect ratio
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    //in base alla grandezza della finestra per poter far 
    //restare tutta la figura nella schermata viengono ricalcolate
    //le dimensioni del contenitore del gioco
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
