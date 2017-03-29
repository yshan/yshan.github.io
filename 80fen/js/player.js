function Player(iid){
	var cards = [];
	var director;
	var id = iid;
	
	this.newGame = function(){
		cards = [];
	}
	
	this.deal = function(card){
		if(card>=0){
			cards.push(card);
			cards.sort(function(a,b){
				return (a%54)-(b%54);
			});
		}
		else{
			director.sortCards(cards);
		}
	}
	
	this.checkMakeMaster = function(){
		var ss = director.getMasterSuites(id);
		var maxlength = 0;
		var suite = -1;
		for(var i=0;i<ss.length;++i){
			var pc = director.getPlayerCards(id,ss[i]);
			if(pc.length>maxlength){
				maxlength = pc.length;
				suite = ss[i];
			}
		}
		if(suite!=-1 && (maxlength>=6 || director.isFirstGame())){
			director.makeMaster(id,suite);
		}
	}
	
	this.getCards = function(){
		return cards;
	}
	
	this.getCardsCount = function(){
		return cards.length;
	}
	
	var removeCard = function(c){
		for(var i=0;i<cards.length;++i){
			if(cards[i]==c){
				cards.splice(i,1);
				return;
			}
		}
	}
	
	var isBiggestCard= function(c,data){
		var side = id%2;
		var cc = c%54;
		var v = director.descCard(c);
		var suite = (v[2]>0)?'X':v[3];
		for(var i=0;i<CN;++i){
			if(i%54>cc && data[i]%2!=side){
				var vv = director.descCard(i);
				var ss = (vv[2]>0)?'X':vv[3];
				if(suite==ss){
					return false;
				}
			}
		}
		return true;
	}
	
	this.koudi = function(c){
		var kcards;
		if(c){
			kcards = c;
		}
		else{
			kcards =[];
			var pc =[];
			var masterSuite = director.getMasterSuite();
			for(var i=0;i<4;++i){
				var s = SUITES[i];
				if(s!=masterSuite){
					var cs = director.getPlayerCards(id,s);
					pc.push(cs);
				}
			}
			pc.sort(function(a,b){return a.length-b.length});
			pc.push(director.getPlayerCards(id,'X'));
			var data = director.getAllCards();
			for(var i=0;i<pc.length && kcards.length<8;++i){
				var ppc = pc[i];
				var groups = director.groupCards(ppc);
				for(var j=0;j<groups.length && kcards.length<8;++j){
					var g = groups[j];
					if(g.length==1){
						var c = g[0];
						if(!isBiggestCard(c,data)){
							kcards.push(c);
						}
					}
				}
			}
			for(var i=0;i<cards.length && kcards.length<8;++i){
				var c = cards[i];
				var found = false;
				for(var j=0;j<kcards.length;++j){
					if(c==kcards[j]){
						found = true;
						break;
					}
				}
				if(!found){
					kcards.push(c);
				}
			}
			console.log("koudi:"+kcards);
		}
		for(var i=0;i<kcards.length;++i){
			removeCard(kcards[i]);
		}
		director.koudi(id,kcards);
	}
	
	var getBiggestCards = function(groups){
		var result = [];
		var c = groups[0][0];
		var v = director.descCard(c);
		var suite = (v[2]>0)?'X':v[3];
		
		var pgs = [];
		for(var p=0;p<4;++p){
			if(p!=id){
				pgs.push(director.getPlayerGroupCards(p,suite));
			}
		}
		
		for(var i=0;i<groups.length;++i){
			var g = groups[i];
			var c0 = g[0]%54;
			var found = false;
			for(var j=0;j<pgs.length && !found;++j){
				var pg = pgs[j];
				for(var k=0;k<pg.length && !found;++k){
					if(pg[k].length>=g.length && pg[k][0]%54>c0){
						found = true;
					}
				}
			}
			if(!found){
				for(var j=0;j<g.length;++j){
					result.push(g[j]);
				}
			}
		}
		
		return result;
	}
	
	var predictTurnWinner = function(t){
		var winner = t.leader;
		var suite = t.suite;
		if(t.cards.length>1){
			winner = director.getTurnWinner(t);
		}
		var windex = (winner-t.leader+4)%4;
		if(winner!=t.leader){
			var c = t.cards[windex][0];
			var sp = director.descCard(c);
			var s = (sp[2]>0)?'X':sp[3];
			if(s!=suite){
				return winner;
			}
		}
		
		var lg = director.groupCards(t.cards[windex]);
		for(var i=t.cards.length;i<4;++i){
			var p = (t.leader+i)%4;
			var pc = director.getPlayerCards(p,suite);
			if(pc.length==0){
				if(i==t.cards.length){
					continue;
				}
				else{
					return -1;
				}
			}
			if(lg.length==1 && pc.length>=t.cards[0].length){
				var pg = director.groupCards(pc);
				pg.sort(function(ga,gb){
					if(ga.length!=gb.length){
						return gb.length-ga.length;
					}
					return director.compareCard(gb[0],ga[0]);
				});
				for(var j=0;j<pg.length;++j){
					if(pg[j].length>=lg[0].length && director.compareCard(pg[j][0],lg[0][0])>0){
						winner = p;
						lg = [pg[j].slice(0,lg[0].length)];
						break;
					}
				}
			}
		}
		console.log("predict winner,current player:"+t.cards.length+",winner:"+winner);
		return winner;
	}
	
	var playLeader = function(){
		var result = [];
		while(true){
			//get the biggest fu cards
			var masterSuite = director.getMasterSuite();
			var slaveCards = [];
			var slaveGroups = [];
			var biggestCards = [];
			for(var i=0;i<4;++i){
				var s = SUITES[i];
				if(s!=masterSuite){
					var cs = director.getPlayerCards(id,s);
					if(cs.length>0){
						slaveCards.push(cs);
						var gs = director.groupCards(cs);
						slaveGroups.push(gs);
						var bcs = getBiggestCards(gs);
						if(bcs.length>0){
							biggestCards.push(bcs);
						}
					}
				}
			}
			if(biggestCards.length>0){
				var index = Math.floor((Math.random()*biggestCards.length));
				var cc = biggestCards[index];
				for(var i=0;i<cc.length;++i){
					result.push(cc[i]);
				}
				break;
			}
			//loop all group, which len>2
			var duiGroups = [];
			for(var i=0;i<slaveGroups.length;++i){
				var groups = slaveGroups[i];
				if(groups.length<2){
					duiGroups = [groups[0]];
					break;
				}
				for(var j=0;j<groups.length;++j){
					var g = groups[j];
					if(g.length>1){
						duiGroups.push(g);
					}
				}
			}
			if(duiGroups.length>0){
				duiGroups.sort(function(ga,gb){
					if(ga.length!=gb.length){
						return gb.length-ga.length;
					}
					return ga[0]%54-gb[0]%54;
				});
				var g = duiGroups[0];
				for(var i=0;i<g.length;++i){
					result.push(g[i]);
				}
				break;
			}
			//find a master card
			var masterCards = director.getPlayerCards(id,'X');
			if(masterCards.length>0){
				var groups =  director.groupCards(masterCards);
				if(groups.length>1){
					var e1 = director.getPlayerCards((id+1)%4,'X');
					var e2 = director.getPlayerCards((id+3)%4,'X');
					if(e1.length>0 || e2.length>0){
						if(masterCards.length>=e1.length && masterCards.length>=e2.length){
							groups.sort(function(a,b){
								var va = director.descCard(a[0]);
								var vb = director.descCard(b[0]);
								if(va[0]!=vb[0]){
									return va[0]-vb[0];
								}
								if(a.length!=b.length){
									return a.length-b.length;
								}
								if(a.length>1){
									return director.compareCard(b[0],a[0]);
								}
								else{
									return director.compareCard(a[0],b[0]);
								}
							});
							var cc = groups[0];
							for(var i=0;i<cc.length;++i){
								result.push(cc[i]);
							}
							break;
						}
					}
				}
			}
			//
			var cc = cards.slice(0);
			var groups = director.groupCards(cc);
			groups.sort(function(ga,gb){
				if(ga.length!=gb.length){
					return ga.length-gb.length;
				}
				var va = director.descCard(ga[0]);
				var vb = director.descCard(gb[0]);
				if(va[0]!=vb[0]){
					return va[0]-vb[0];
				}
				if(va[1]!=vb[1]){
					return va[1]-vb[1];
				}
				if(va[2]!=vb[2]){
					return va[2]-vb[2];
				}
				if(va[2]==0){
					return ga[0]%54%13-gb[0]%54%13;
				}
				else{
					return director.compareCard(ga[0],gb[0]);
				}
			});
			var g = groups[0];
			for(var j=0;j<g.length;++j){
				result.push(g[j]);
			}
			break;
		}
		return result;
	}
	
	var playFollow = function(){
		var turn = director.getCurrentTurn();
		var pc = director.getPlayerCards(id,turn.suite);
		var result = [];
		var cardlength = turn.cards[0].length;
		var winner = predictTurnWinner(turn);
		var score = director.getTurnScore(turn);
		var side = turn.cards.length;
		
		if(pc.length == 0){
			var bi = false;
			if(winner>=0 && winner!=((id+2)%4)){
				bi = true;
			}
			if(side==3){
				bi = bi && score>0;
			}
			if(bi){
				var px = director.getPlayerCards(id,'X');
				if(px.length>0){
					var pg = director.groupCards(px);
					var wside = (winner-turn.leader+4)%4;
					var useBiggerMaster = false;
					if(wside<turn.cards.length){
						var sp = director.descCard(turn.cards[wside][0]);
						if(sp[2]>0){
							useBiggerMaster= true;
						}
					}
					if(useBiggerMaster){ // it is also a master
						var g0 = director.groupCards(turn.cards[wside]);
						g0.sort(function(ga,gb){
							if(ga.length!=gb.length){
								return gb.length-ga.length;
							}
							else{
								return director.compareCard(gb[0],ga[0]);
							}
						});
						var needBigger = true;
						for(var i=0;i<g0.length;++i){
							var match = false;
							for(var j=0;j<pg.length;++j){
								if( (pg[j].length==g0[i].length)
									&& ((needBigger && director.compareCard(pg[j][0],g0[i][0])>0) || (!needBigger)) ){
									needBigger = false;
									match = true;
									for(var k=0;k<pg[j].length;++k){
										result.push(pg[j][k]);
									}
									pg.splice(j,1);
									break;
								}
							}
							if(!match){
								result=[];
								break;
							}
						}
					}
					else{
						var g0 = director.groupCards(turn.cards[0]);
						pg.sort(function(ga,gb){
							if(ga.length!=gb.length){
								return gb.length-ga.length;
							}
							var va = director.descCard(ga[0]);
							var vb = director.descCard(gb[0]);
							if(va[5]!=vb[5]){
								return vb[5]-va[5];
							}
							else{
								return director.compareCard(ga[0],gb[0]);
							}
						});
						for(var i=0;i<g0.length;++i){
							var match = false;
							for(var j=0;j<pg.length;++j){
								if(pg[j].length == g0[i].length){
									match = true;
									for(var k=0;k<pg[j].length;++k){
										result.push(pg[j][k]);
									}
									pg.splice(j,1);
									break;
								}
							}
							if(!match){
								result=[];
								break;
							}
						}
					}
				}
			}
		}
		else if(pc.length<=cardlength){
			for(var i=0;i<pc.length;++i){
				result.push(pc[i]);
			}
		}
		else{
			var pg = director.groupCards(pc);
			var lg = director.groupCards(turn.cards[0]);
			var tryWin;
			var followScore;
			
			if(turn.suite=='X' && lg.length==1){
				var tw = director.getTurnWinner(turn);
				var wside = (tw-turn.leader+4)%4;
				var maxcard = turn.cards[wside][0];
				var safecard = director.makeCard('X','A');
				if(side==1){
					tryWin = true;
					followScore = false;
				}
				else if(side==2){
					if(wside == 0 && director.compareCard(maxcard,safecard)>=0){
						tryWin = false;
						followScore = true;
					}
					else{
						tryWin = true;
						followScore = false;
					}
				}
				else{
					if(wside == 1){
						tryWin = false;
						followScore = true;
					}
					else if(score>0){
						tryWin = true;
						followScore = false;
					}
					else{
						tryWin = false;
						followScore = false;
					}
				}
				pg.sort(function(ga,gb){
					if(ga.length!=gb.length){
						return ga.length-gb.length;
					}
					var va = director.descCard(ga[0]);
					var vb = director.descCard(gb[0]);
					if(vb[5]!=va[5]){
						return followScore?(vb[5]-va[5]):(va[5]-vb[5]);
					}
					if(!tryWin){
						return director.compareCard(ga[0],gb[0]);
					}
					var bga = (director.compareCard(ga[0],maxcard)>0);
					var bgb = (director.compareCard(gb[0],maxcard)>0);
					if(bga!=bgb){
						return director.compareCard(gb[0],ga[0]);
					}
					else{
						return director.compareCard(ga[0],gb[0]);
					}
				});
			}
			else{
				if(winner==id){
					tryWin = true;
					followScore = false;
				}
				else if(winner==((id+2)%4)){
					tryWin = false;
					followScore = true;
				}
				else{
					tryWin = false;
					followScore = false;
				}
				pg.sort(function(ga,gb){
					if(ga.length!=gb.length){
						return ga.length-gb.length;
					}
					var va = director.descCard(ga[0]);
					var vb = director.descCard(gb[0]);
					if(vb[5]!=va[5]){
						return followScore?(vb[5]-va[5]):(va[5]-vb[5]);
					}
					return tryWin?director.compareCard(gb[0],ga[0]):director.compareCard(ga[0],gb[0]);
				});
			}
			
			for(var i=0;i<lg.length;++i){
				var len = lg[i].length;
				var found = false;
				var len0 = len;
				var left = len;
				while(left>0 && len>=2){
					var count = Math.floor(len0/len);
					for(var cc=0;cc<count;++cc){
						for(var j=0;j<pg.length;++j){
							if(pg[j].length>=len){
								left -= len;
								for(var k=0;k<len;++k){
									result.push(pg[j][k]);
								}
								if(pg[j].length==len){
									pg.splice(j,1);
								}
								else{
									pg[j].splice(0,len);
								}
								break;
							}
						}
					}
					len -= 2;
				}
			}
			for(var i=0;i<pg.length && result.length<cardlength;++i){
				var g = pg[i];
				for(var j=0;j<g.length && result.length<cardlength;++j){
					result.push(g[j]);
				}
			}
			for(var i=0;i<pc.length && result.length<cardlength;++i){
				var c = pc[i];
				var found = false;
				for(var j=0;j<result.length;++j){
					if(c == result[j]){
						found = true;
						break;
					}
				}
				if(!found){
					result.push(c);
				}
			}
		}
		if(result.length<cardlength){
			var cc = cards.slice(0);
			for(var i=0;i<result.length;++i){
				for(var j=0;j<cc.length;++j){
					if(cc[j] == result[i]){
						cc.splice(j,1);
						break;
					}
				}
			}
			var groups = director.groupCards(cc);
			groups.sort(function(ga,gb){
				if(ga.length!=gb.length){
					return ga.length-gb.length;
				}
				var va = director.descCard(ga[0]);
				var vb = director.descCard(gb[0]);
				if(va[0]!=vb[0]){
					return va[0]-vb[0];
				}
				if(va[1]!=vb[1]){
					return va[1]-vb[1];
				}
				if(va[2]!=vb[2]){
					return va[2]-vb[2];
				}
				if(va[5]!=vb[5]){
					return (winner==(id+2)%4)?(vb[5]-va[5]):(va[5]-vb[5]);
				}
				if(va[2]==0){
					return ga[0]%54%13-gb[0]%54%13;
				}
				else{
					return director.compareCard(ga[0],gb[0]);
				}
			});
			for(var i=0;i<groups.length && result.length<cardlength;++i){
				var g = groups[i];
				for(var j=0;j<g.length && result.length<cardlength;++j){
					result.push(g[j]);
				}
			}
		}
		return result;
	}
	
	this.play = function(c){
		var kcards;
		if(c){
			kcards = c;
		}
		else{
			if(director.isLeader()){
				kcards = playLeader();
			}
			else{
				var turn = director.getCurrentTurn();
				kcards = playFollow();
			}
		}
		if(director.play(id,kcards)){
			for(var i=0;i<kcards.length;++i){
				removeCard(kcards[i]);
			}
		}
	}
	
	this.setDirector = function(d){
		director = d;
	}
}