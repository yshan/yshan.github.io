var CN = 108; //cards total number
var SUITES = ['h','s','d','c','j','J'];
var SUITES_MSG={'-1':'无主','h':'红桃','s':'黑桃','d':'方块','c':'梅花','j':'小鬼','J':'大鬼'};
var LOC_MSG=['南','东','北','西'];
var POINTS = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A','O'];

function val(card){
	if(card>53){
		card=card-54;
	}
	if(card==53){
		return ['J','O'];
	}
	if(card==52){
		return ['j','O'];
	}
	var p = card%13;
	var s = (card-p)/13;
	return [SUITES[s],POINTS[p]];
}

function str(card){
	var sp = val(card);
	return sp[0]+sp[1];
}

function strs(cards){
	var result = [];
	for(var i=0;i<cards.length;++i){
		result.push(str(cards[i]));
	}
	return result;
}

var STATUS = {
	NOT_STARTED:0,
	DEAL:1, //发牌
	KOUDI:2, //扣底
	PLAY:3,//出牌
	COMPLETE:3
};

function Turn(){
	this.leader = -1;
	this.cards = [];
	this.suite = -1;
	this.groupsCount;
	this.lastScore;
	
	this.addCards = function(c){
		this.cards.push(c);
	}
};

function Director(){
	var data = new Array(CN);
	var order;
	var players;
	var boss;
	var status;
	var currentPoint;
	var points;
	var currentMaster;
	var currentScore;
	var currentMasterCount;
	var lastMasterOwner;
	var dealingCards;
	var dealingPlayer;
	var currentPlayer;
	var turnCounter;
	var turns;
	var firstGame;
	
	var init = function(){
		for(var i=0;i<CN;++i){
			data[i] = -1;
		}
		boss = 0;
		currentPoint = 0;
		points = [0,0];
		status = 0;
		firstGame = true;
	}
	
	this.getAllCards = function(){
		return data.slice(0);
	}
	
	this.getMasterSuite = function(){
		return currentMaster;
	}
	
	this.getCurrentPoint = function(){
		return POINTS[currentPoint];
	}
	
	this.getPoints = function(){
		return [POINTS[points[0]],POINTS[points[1]]];
	}
	
	this.getCurrentScore = function(){
		return currentScore;
	}
	
	this.getCurrentPlayer = function(){
		return currentPlayer;
	}
	
	this.getLastMasterOwner = function(){
		return lastMasterOwner;
	}
	
	this.getCurrentMasterCount = function(){
		return currentMasterCount;
	}
	
	this.setPlayers = function(p){
		players = p;
		for(var i=0;i<players.length;++i){
			players[i].setDirector(this);
		}
	}
	
	this.getStatus = function(){
		return status;
	}
	
	this.getBoss = function(){
		return boss;
	}
	
	this.isLeader = function(){
		return turnCounter%4==0;
	}
	
	this.isFirstGame = function(){
		return firstGame;
	}
	
	this.getCurrentTurn = function(){
		if(turns.length>0){
			return turns[turns.length-1];
		}
		return null;
	}
	
	this.getPreviousTurn = function(){
		if(turns.length>1){
			return turns[turns.length-2];
		}
		return null;
	}
	
	this.makeCard = function(suite,point){
		if(suite=='j'){
			return 52;
		}
		else if(suite=='J'){
			return 53;
		}
		else if(suite=='X'){
			suite=currentMaster;
		}
		var s,p;
		for(s=0;s<4;++s){
			if(SUITES[s]==suite){
				for(p=0;p<13;++p){
					if(POINTS[p]==point){
						return s*13+p;
					}
				}
			}
		}
		return -1;
	}
	
	var reorder = function(){
		order = new Array(CN);
		for(var i=0;i<CN;++i){
			var s = i%54;
			var v = valex(i);
			if(s==53){
				s = 10000;
			}
			else if(s==52){
				s = 9999;
			}
			else if(v[1]>0){ //current point
				s = 1000+v[2];
			}
			else{
				if(s%13>currentPoint){
					--s;
				}
				if(v[2]>0){ //master
					s+=100;
				}
			}
			order[i] = s;
		}
	}
	
	this.newGame = function(){
		status = STATUS.DEAL;
		currentMaster = -1;
		currentMasterCount = 0;
		currentPoint = points[boss%2];
		lastMasterOwner = -1;
		dealingCards = new Array(CN);
		dealingPlayer = boss;
		currentScore = 0;
		turns = [];
		for(var i=0;i<CN;++i){
			data[i]=-1;
		}
		for(var i=0;i<4;++i){
			players[i].newGame();
		}
		for(var i=0;i<CN;++i){
			dealingCards[i] = i;
		}
		//shuffle
		for(var i=0;i<CN;++i){
			var j = Math.floor((Math.random()*CN));
			if(i!=j){
				var t = dealingCards[i];
				dealingCards[i]=dealingCards[j];
				dealingCards[j]=t;
			}
		}
	}
	
	this.endGame = function(){
		firstGame = false;
		var t = turns[turns.length-1];
		var winner = this.getTurnWinner(t);
		if(winner%2!=boss%2){
			var cards = this.getDiCards();
			var s = getCardsScore(cards);
			if(s>0){
				var times = 2;
				var g = this.groupCards(t.cards[0]);
				switch(g[0].length){
					case 2:
						times =4;
						break;
					case 4:
						times =8;
						break;
					case 6:
						times =12;
						break;
					case 8:
						times =16;
						break;
					default:
						times =2;
						break;
				}
				currentScore += (s*times);
			}
		}
		if(currentScore<80){
			if(points[boss%2]==12){
				return boss;
			}
			var level = Math.floor((80-currentScore)/20+1);
			points[boss%2] += level;
			boss = (boss+2)%4;
			
		}
		else{
			var level = Math.floor((currentScore-80)/20+1);
			boss = (boss+1)%4;
			if(points[boss%2]!=0){
				points[boss%2] += level;
			}
		}
		if(points[boss%2]>12){
			points[boss%2] = 12;
		}
		return -1;
	}
	
	this.deal = function(){
		if(status==STATUS.DEAL && dealingCards.length>8){
			var card = dealingCards.pop();
			data[card] = dealingPlayer;
			players[dealingPlayer].deal(card);
			console.log("deal card:"+card+" to:"+dealingPlayer);
			if(++dealingPlayer>=4) dealingPlayer=0;
			return true;
		}
		return false;
	}
	
	this.dealdi = function(){
		if(status==STATUS.DEAL && dealingCards.length==8){
			reorder();
			for(var i=0;i<dealingCards.length;++i){
				var card = dealingCards[i];
				data[card] = boss;
				players[boss].deal(card);
			}
			for(var i=0;i<4;++i){
				players[i].deal(-1);
			}
			status = STATUS.KOUDI;
			return true;
		}
		return false;
	}
	
	var canMakeMaster = function(player,suite){
		if(status!=STATUS.DEAL){
			return false;
		}
		//verify whether the card belong to the player
		var master = POINTS[currentPoint];
		var count = 0;
		for(var i=0;i<CN;++i){
			if(data[i]==player){
				var sp =val(i);
				if(sp[0]==suite && (sp[1]==master || sp[1]=='O')){
					++count;
				}
			}
		}
		if(suite=='j' || suite=='J'){
			if(count<2){
				return false;
			}
			if(currentMaster=='j' && suite!='J'){
				return false;
			}
			if(currentMaster=='J'){
				return false;
			}
		}
		else if(count<=currentMasterCount){
			return false;
		}
		
		//can't change the master suite made by self
		if(player==lastMasterOwner && suite!=currentMaster){
			return false;
		}
		
		return true;
	}
	
	this.getMasterSuites = function(player){
		var result = [];
		for(var i=0;i<SUITES.length;++i){
			var s = SUITES[i];
			if(canMakeMaster(player,s)){
				result.push(s);
			}
		}
		return  result;
	}
	
	this.makeMaster = function(player,suite){
		if(!canMakeMaster(player,suite)){
			return false;
		}
		
		if(firstGame){
			boss = player;
		}
		
		currentMaster = suite;
		++currentMasterCount;
		if(currentMasterCount>2) currentMasterCount=2;
		lastMasterOwner = player;
		return true;
	}
	
	this.getDiCards = function(){
		var result =[];
		for(var i=0;i<CN;++i){
			if(data[i]==10){
				result.push(i);
			}
		}
		return result;
	}
	
	this.koudi = function(player,cards){
		if(status!=STATUS.KOUDI){
			return false;
		}
		
		if(player!=boss){
			return false;
		}
		
		if(cards.length!=8){
			return false;
		}
		
		for(var i=0;i<cards.length;++i){
			if(data[cards[i]]!=player){
				return false;
			}
		}
		
		for(var i=0;i<cards.length;++i){
			var card = cards[i];
			data[card] = 10;
		}
		status = STATUS.PLAY;
		currentPlayer = boss;
		turnCounter = 0;
		return true;
	}
	
	var valex = function(c){
		var sp = val(c);
		var isJoker = 0, isPoint = 0, isMaster = 0;
		if(sp[1]=='O'){
			isJoker = 1;
			isMaster= 1;
		}
		else{
			if(sp[1] == POINTS[currentPoint]){
				isPoint=1;
				isMaster=1;
			}
			if(sp[0] == currentMaster){
				++isMaster;
			}
		}
		var score = 0;
		if(sp[1]=='K' || sp[1]==10){
			score = 10;
		}
		else if(sp[1]==5){
			score = 5;
		}
		return [isJoker,isPoint,isMaster,sp[0],sp[1],score];
	}
	
	var compareCard = function(a,b){
		return (order[a]==order[b])?(a%54-b%54):(order[a]-order[b]);
	}
	
	this.compareCard = function(a,b){
		return order[a]-order[b];
	}
	
	var sortGroups = function(groups){
		groups.sort(function(a,b){
			if(b.length==a.length){
				return compareCard(a[0],b[0]);
			}
			return b.length-a.length;
		});
	}
	
	this.descCard = function(c){
		return valex(c);
	}
	
	this.groupCards = function(cards){
		cards.sort(compareCard);
		
		var result = [];
		var i = 0;
		var pre = -1;
		var group;
		while(i<cards.length){
			var s=i;
			var start = order[cards[s]];
			var e=s;
			var last = start;
			var lastc = cards[s]%54;
			var len;
			while(++i<cards.length){
				var end = order[cards[i]];
				var endc = cards[i]%54;
				len = (i-s)+1; 
				if(((len%2==0) && (end==last && endc==lastc)) 
					|| ((len%2==1) && (end==last+1))){
					last = end;
					lastc = endc;
					e = i;
					continue;
				}
				break;
			}
			len = (e-s)+1;
			if(len>1 && len%2!=0){
				--e;--i;
			}
			result.push(cards.slice(s,e+1));
		}
		sortGroups(result);
		return result;
	}
	
	this.groupCardsCount = function(cards){
		var result = {};
		var groups = this.groupCards(cards);
		for(var i=0;i<groups.length;++i){
			var g = groups[i];
			if(result[g.length]){
				++(result[g.length]);
			}
			else{
				result[g.length] = 1;
			}
		}
		return result;
	}
	
	this.sortCards = function(cards){
		return cards.sort(compareCard);
	}
	
	this.getPlayerCards = function(player,suite){
		var cards =[];
		var isMaster = (suite=='X');
		for(var i=0;i<CN;++i){
			var c = data[i];
			if(c==player){
				var v = valex(i);
				if(isMaster && v[2]>0){
					cards.push(i);
				}
				else if(!isMaster && v[2]==0 && v[3]==suite){
					cards.push(i);
				}
			}
		}
		return cards;
	}
	
	this.getPlayerGroupCards = function(player,suite){
		return this.groupCards(this.getPlayerCards(player,suite));
	}
	
	this.matchGroups = function(g1,g2){
		for(var i=0;i<g1.length;++i){
			var len = g1[i].length;
			if(len>1){
				if(g2.length==0 || g2[0].length<len){
					return false;
				}
				else if(g2[0].length>len){
					g2[0].splice(0,len);
					sortGroups(g2);
				}
				else if(g2[0].length==len){
					g2.splice(0,1);
				}
			}
		}
		return true;
	}
	
	var isSameSuite = function(cards){
		var v0= valex(cards[0]);
		var s0 =(v0[2]>0)?'X':v0[3];
		for(var i=1;i<cards.length;++i){
			var v= valex(cards[i]);
			var s =(v[2]>0)?'X':v[3];
			if(s!=s0){
				return false;
			}
		}
		return true;
	}
	
	this.getTurnWinner = function(t){
		var winner = 0;
		var g = [];
		for(var i=0;i<t.cards.length;++i){
			g.push(this.groupCards(t.cards[i]));
		}
		var maxlength = g[0][0].length;
		var maxcard = -1;
		for(var i=0;i<g[0].length;++i){
			if(g[0][i].length>=maxlength){
				var c = g[0][i][g[0][i].length-1];
				if(c>maxcard){
					maxcard = c ;
				}
			}
		}
		var v0 = valex(maxcard);
		for(var i=1;i<t.cards.length;++i){
			var maxer = false;
			var tmpcard = maxcard;
			for(var j=0;j<g[i].length;++j){
				if(g[i][j].length>=maxlength){
					var cc = g[i][j][g[i][j].length-1];
					if(compareCard(cc,tmpcard)>0){
						maxer = true;
						tmpcard = cc;
					}
				}
			}
			var c = g[i][0][0];
			if(maxer && isSameSuite(t.cards[i]) && this.matchGroups(g[0],g[i])){
				var v = valex(c);
				if(v[2]==0 && v[3]!=v0[3]){
					continue;
				}
				winner = i;
				maxcard = tmpcard;
			}
		}
		
		return (t.leader+winner)%4;
	}
	
	var getCardsScore = function(cards){
		var score = 0;
		for(var j=0;j<cards.length;++j){
			var point = val(cards[j])[1];
			if(point==5){
				score += 5;
			}
			else if(point==10 || point=='K'){
				score += 10;
			}
		}
		return score;
	}
	
	this.getTurnScore = function(t){
		var score = 0;
		for(var i=0;i<t.cards.length;++i){
			var cs = t.cards[i];
			score += getCardsScore(cs);
		}
		return score;
	}
	
	this.play = function(player,cards){
		if(!this.isLegalPlay(player,cards)){
			return false;
		}
		
		var leader = (turnCounter%4==0);
		if(leader){
			var groups = this.groupCards(cards);
			var v = valex(cards[0]);
			var suite =(v[2]>0)?'X':v[3];
			if(groups.length>1){ //check if there any bigger than the cards
				var found = false;
				var index = -1;
				for(var p=0;p<4 && !found;++p){
					if(p!=player){
						var pg = this.getPlayerGroupCards(p,suite);
						for(var i=0;i<groups.length &&!found;++i){
							var g = groups[i];
							var num = order[g[0]];
							for(var j=0;j<pg.length &&!found ;++j){
								if(g.length<=pg[j].length && order[pg[j][0]]>num){
									found = true;
									index =i;
								}
							}
						}
					}
				}
				if(found){
					cards.splice(0,cards.length);
					var g = groups[index];
					for(var i=0;i<g.length;++i){
						cards.push(g[i]);
					}
				}
			}
			var t = new Turn();
			t.suite = suite;
			t.leader = currentPlayer;
			t.lastScore = currentScore;
			t.groupsCount = this.groupCardsCount(cards);
			turns.push(t);
		}
		console.log("player:"+player+",out:"+strs(cards));
		for(var i=0;i<cards.length;++i){
			var card = cards[i];
			data[card] = player+4;
		}
		turns[turns.length-1].addCards(cards);
		if(++turnCounter%4==0){ //turn over
			var t = turns[turns.length-1];
			var winner = this.getTurnWinner(t);
			if(winner%2!=boss%2){
				currentScore += this.getTurnScore(t);
			}
			currentPlayer = winner;
		}
		else{
			++currentPlayer;
			if(currentPlayer>=4){
				currentPlayer = 0;
			}
		}
	
		return true;
	}
	
	this.isLegalPlay = function(player,cards){
		if(status!=STATUS.PLAY){
			return false;
		}
		if(player!=currentPlayer){
			return false;
		}
		if(cards.length<1){
			return false;
		}
		for(var i=0;i<cards.length;++i){
			if(data[cards[i]]!=player){
				return false;
			}
		}
		var leader = (turnCounter%4==0);
		if(leader){
			var s=-1;
			var m=-1;
			for(var i=0;i<cards.length;++i){
				var card = cards[i];
				var v = valex(card);
				if(s==-1){
					s = v[3];
					m = v[2];
				}
				else if(m>0 && v[2]>0){ //both are master
					continue;
				}
				else if(s!=v[3]){
					return false;
				}
			}
		}
		else{
			var t = turns[turns.length-1];
			if(cards.length!=t.cards[0].length){
				return false;
			}
			var scards = this.getPlayerCards(player,t.suite);
			if(scards.length<=cards.length){ //all cards must be out
				for(var i=0;i<scards.length;++i){
					var c = scards[i];
					var match = false;
					for(var j=0;j<cards.length;++j){
						if(c == cards[j]){
							match = true;
							break;
						}
					}
					if(!match){
						return false;
					}
				}
			}
			else{
				for(var i=0;i<cards.length;++i){
					var c = cards[i];
					var match = false;
					for(var j=0;j<scards.length;++j){
						if(c == scards[j]){
							match = true;
							break;
						}
					}
					if(!match){
						return false;
					}
				}
				var sgc = this.groupCardsCount(scards);
				var gc = this.groupCardsCount(cards);
				for(var i in t.groupsCount){
					if(i>1){
						var cc = t.groupsCount[i];
						var ii = i;
						while(ii>=2 && !sgc[ii]){
							ii = ii-2;
						}
						if(i!=ii){
							cc = Math.floor((cc*i/ii));
						}
						if(!sgc[ii]){
							continue;
						}
						if(!gc[ii]){
							return false;
						}
						if(sgc[ii]>=cc){
							if(gc[ii]<cc){
								return false;
							}
						}
						else{
							if(gc[ii]!=sgc[ii]){
								return false;
							}
						}
					}
				}
			}
		}
		return true;
	}
	
	this.isGameover = function(){
		for(var i=0;i<CN;++i){
			if(data[i]>=0 && data[i]<=3){
				return false;
			}
		}
		return true;
	}
	
	this.undoTurn = function(){
		if(turns.length>0){
			var t = turns.pop();
			for(var i=0;i<t.cards.length;++i){
				var pid = (t.leader+i)%4;
				var cards = t.cards[i];
				for(var j=0;j<cards.length;++j){
					var c = cards[j];
					data[c]=pid;
					players[pid].deal(c);
				}
				players[pid].deal(-1);
				--turnCounter;
			}
			currentPlayer = t.leader;
			currentScore = t.lastScore;
		}
	}
	
	init();
}