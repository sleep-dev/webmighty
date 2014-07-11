var stage;
var queue;
var canvas;

var card_img;

var carddeck;
var trick;
var takenTrick;

var scale;
var player;
var boss;
var friend;

var startpos = [{x:400, y:610},{x:60, y:300}, {x:100, y:0}, {x:832, y:0}, {x:964, y:300}];
var endpos = [{x:462, y:450}, {x:310, y:300}, {x:380, y:110}, {x:544, y:110}, {x:614, y:300}];

var deckpos = [{x:270, y:610}, {x:70, y:200}, {x:480, y:70}, {x:1000, y:70}, {x:954, y:662}]; 
var trickpos = [{x:270, y:570}, {x:110, y:200}, {x:480, y:110}, {x:1000, y:110}, {x:914, y:662}];
var takepos = [{x:400, y:610},{x:60, y:300}, {x:100, y:0}, {x:832, y:0}, {x:964, y:300}, {x:462, y:312}];

function init(){
    var load_img = [];
    for(i = 2; i < 15; i++){
        load_img.push({'id' : 'd'+i, 'src' : 'assets/cards/'+i+'d.png'})
        load_img.push({'id' : 'h'+i, 'src' : 'assets/cards/'+i+'h.png'})
        load_img.push({'id' : 's'+i, 'src' : 'assets/cards/'+i+'s.png'})
        load_img.push({'id' : 'c'+i, 'src' : 'assets/cards/'+i+'c.png'})
    }
    load_img.push({'id' : 'b', 'src' : 'assets/cards/b.png'});

    queue = new createjs.LoadQueue();
    queue.addEventListener("complete", loadComplete);
    queue.loadManifest(load_img);

    canvas = document.getElementById('mainCanvas');
    canvas.height = 768;
    canvas.width = 1024;
    scale = 1;
}

function loadComplete(){
    console.log('load_end');

    card_img = {};
    g = createjs.Graphics;
    s_color = 'rgba(0, 0, 0, 1)';

    for(i = 2; i < 15; i++){
        card_img['d'+i] = new g().ss(4).s(s_color).bf(queue.getResult('d'+i)).rr(0, 0, 500, 726, 20).es();
        card_img['h'+i] = new g().ss(4).s(s_color).bf(queue.getResult('h'+i)).rr(0, 0, 500, 726, 20).es();
        card_img['s'+i] = new g().ss(4).s(s_color).bf(queue.getResult('s'+i)).rr(0, 0, 500, 726, 20).es();
        card_img['c'+i] = new g().ss(4).s(s_color).bf(queue.getResult('c'+i)).rr(0, 0, 500, 726, 20).es();
    }

    card_img['b'] = new g().ss(4).s(s_color).bf(queue.getResult('b')).rr(0, 0, 342, 480, 10).es();

    stage = new createjs.Stage("mainCanvas");
    stage.enableMouseOver(20);

    createjs.Ticker.addEventListener("tick", stage);
    createjs.Touch.enable(stage);

    takenTrick = [];
    for(i=0; i<5; i++){
        takenTrick.push(new createjs.Container());
        takenTrick[i].x = trickpos[i].x;
        takenTrick[i].y = trickpos[i].y;
        stage.addChild(takenTrick[i]);
    }
    takenTrick[1].rotation = 90;
    takenTrick[2].rotation = 180;
    takenTrick[3].rotation = 180;
    takenTrick[4].rotation = -90;

    trick = new createjs.Container();
    stage.addChild(trick);
}

function resize_window(){
}

function GameInit(p_id, cardlist){
    player = p_id;
    DeckGenerate(cardlist);
}

function CardGenerate(id, selectable){
    card = new createjs.Shape(card_img[id]);
    card.name = id;
    card.cursor = 'pointer';
    card.scaleX = card.scaleY = 0.2;
    if(id == 'b') card.scaleX = card.scaleY = 0.3;

    if(selectable){
        card.on('rollover', function (evt){ this.y -= 20*scale;});
        card.on('rollout', function (evt){ this.y += 20*scale;});
        card.on('click', function(evt){PlayCard(id, 2);});
    }

    return card;
}

function DeckGenerate(cardlist){
    carddeck = [];
    carddeck.push(new createjs.Container());
    for( i in cardlist){
        card = CardGenerate(cardlist[i], true);
        card.x = i*40*scale;
        carddeck[0].addChild(card);
    }
    for(j = 1; j<5; j++){
        carddeck.push(new createjs.Container());
        for(i=0; i<10; i++){
            card = CardGenerate('b', false);
            card.x = i*40*scale;
            carddeck[j].addChild(card);
        }
    }
    for(j = 0; j<5; j++){
        carddeck[j].scaleX = carddeck.scaleY = scale;
        carddeck[j].x = deckpos[j].x;
        carddeck[j].y = deckpos[j].y;
        stage.addChild(carddeck[j]);
    }
    carddeck[1].rotation = 90;
    carddeck[2].rotation = 180;
    carddeck[3].rotation = 180;
    carddeck[4].rotation = -90;
}

function PlayCard(id, playerid){
    //id의 카드를 사용
    if(playerid == player){
        card = carddeck.getChildByName(id);
        if(!card){
            alert("Don't do the cheat!");
            return;
        }
        carddeck.removeChild(card);
        for(i in carddeck.children){
            carddeck.children[i].x = i*40*scale;
        }
    }

    var card = CardGenerate(id, false);
    var pos = (playerid+5-player)%5;
    card.x = startpos[pos].x*scale;
    card.y = startpos[pos].y*scale;

    var dest = {x: endpos[pos].x*scale, y: endpos[pos].y*scale};
    
    createjs.Tween.get(card).to(dest, 2000, createjs.Ease.getElasticOut(1, 1));

    trick.addChild(card);
}

function TakeTrick(playerid){
    var AddPlayerTrick = function (card, pos){
        trick.removeChild(card);
        if(card.name.length == 3 && playerid != boss && playerid != friend){
            card.x = takenTrick[pos].children.length*40*scale;
            card.y = 0;
            takenTrick[pos].addChild(card)
        }
    }

    var pos;
    if(playerid == boss || playerid == friend) pos = 5;
    else pos = (playerid + 5 - player)%5;

    var dest = {x:takepos[pos].x*scale, y:takepos[pos].y*scale};
    for(i in trick.children){
        createjs.Tween.get(trick.children[i]).wait(200*i).to(dest, 1000)
            .call(AddPlayerTrick, [trick.children[i], pos]);
    }
}
