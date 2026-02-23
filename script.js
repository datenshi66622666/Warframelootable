// Traductions des missions
var trans = {
    "Survival": "Survie", "Defense": "Défense", "Rescue": "Sauvetage", 
    "Spy": "Espionnage", "Excavation": "Excavation", "Capture": "Capture", 
    "Interception": "Interception", "Sabotage": "Sabotage", "Mobile Defense": "Défense Mobile"
};

var intervals = [];

function startTicker(id, expiry) {
    var el = document.getElementById(id);
    if (!el || !expiry) return;
    var up = function() {
        var diff = new Date(expiry).getTime() - new Date().getTime();
        if (diff <= 0) { el.innerHTML = "MAJ..."; return; }
        var h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
        el.innerHTML = (h>0?h+'h ':'')+(m<10?'0'+m:m)+'m '+(s<10?'0'+s:s)+'s';
    };
    up();
    intervals.push(setInterval(up, 1000));
}

// Fonction principale appelée par ton application
function updateStats(json) {
    try {
        var data = (typeof json === 'string') ? JSON.parse(json) : json;
        
        // Nettoyage des anciens timers
        for(var t=0; t<intervals.length; t++) { clearInterval(intervals[t]); }
        intervals = [];

        // --- CYCLES ---
        var cHTML = "";
        var ct = data.cetusCycle || {state:"day"};
        cHTML += `<div class="row"><span class="label">TERRE</span><span class="status">${ct.state==='day'?'JOUR':'NUIT'}</span><span class="timer" id="t1"></span></div>`;
        
        var vl = data.vallisCycle || {state:"cold"};
        cHTML += `<div class="row"><span class="label">VALLIS</span><span class="status ${vl.isWarm?'warm':'cold'}">${vl.state==='warm'?'CHAUD':'FROID'}</span><span class="timer" id="t2"></span></div>`;
        
        var dm = data.cambionCycle || {};
        var dmSt = (dm.active || dm.state || "vome").toLowerCase();
        var dmDisp = dmSt.includes("fass") ? "FASS" : "VOME";
        cHTML += `<div class="row"><span class="label">DEIMOS</span><span class="status ${dmDisp==='FASS'?'fass':'vome'}">${dmDisp}</span><span class="timer" id="t3"></span></div>`;
        
        document.getElementById('cycles-box').innerHTML = cHTML;

        // --- ONDE NOCTURNE ---
        var nHTML = "";
        if(data.nightwave && data.nightwave.activeChallenges) {
            var challenges = data.nightwave.activeChallenges;
            for(var n=0; n < challenges.length; n++) {
                nHTML += `<div class="row" style="flex-wrap:wrap"><span class="label">${challenges[n].title}</span><span style="color:#8c7ae6; font-size:0.7em">${challenges[n].reputation} REP</span><div class="desc">${challenges[n].desc}</div></div>`;
            }
        }
        document.getElementById('nw-box').innerHTML = nHTML;

        // --- INVASIONS ---
        var iHTML = "";
        if(data.invasions) {
            for(var i=0; i < data.invasions.length; i++) {
                var inv = data.invasions[i];
                if(inv.completed) continue;
                iHTML += `<div class="row" style="flex-wrap:wrap"><span class="label">${inv.node}</span><div class="node-info">${inv.attackerReward.itemString} vs ${inv.defenderReward.itemString}</div><div class="inv-bar"><div class="inv-grineer" style="width:${inv.completion}%"></div><div class="inv-corpus" style="width:${100-inv.completion}%"></div></div></div>`;
                if(i > 4) break; 
            }
        }
        document.getElementById('inv-box').innerHTML = iHTML;

        // --- FAILLES ---
        var fHTML = "";
        if(data.fissures) {
            for(var j=0; j < data.fissures.length; j++) {
                var f = data.fissures[j];
                var isS = f.isHard || (f.tier && f.tier.indexOf("Steel Path") !== -1);
                var mFr = trans[f.missionType] || f.missionType;
                fHTML += `<div class="row" style="flex-wrap:wrap"><span class="status ${isS?'steel':''}">${isS?"ROUTE DE L'ACIER":f.tier}</span><span class="timer" id="f${j}"></span><div class="node-info">${f.node} — ${mFr}</div></div>`;
            }
        }
        document.getElementById('fissures-box').innerHTML = fHTML;

        // Activation Timers
        if(ct.expiry) startTicker('t1', ct.expiry);
        if(vl.expiry) startTicker('t2', vl.expiry);
        if(dm.expiry) startTicker('t3', dm.expiry);
        if(data.fissures) { for(var k=0; k<data.fissures.length; k++) { startTicker('f'+k, data.fissures[k].expiry); } }

    } catch(e) { console.error("Erreur API:", e); }
}
