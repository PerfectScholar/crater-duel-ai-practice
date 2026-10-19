import {Game,DT} from './core/game.js';import {Renderer} from './render.js';
const g=new Game(),r=new Renderer(document.querySelector('canvas')),$=id=>document.getElementById(id),keys=new Set();let last=0,acc=0,chargeOwner=null;
function startCharge(owner){if(chargeOwner!==null)return;if(g.command({type:'charge'}))chargeOwner=owner;}
function releaseCharge(owner){if(chargeOwner!==owner)return;chargeOwner=null;g.command({type:'release'});}
function interruptCharge(){chargeOwner=null;keys.clear();g.command({type:'cancelCharge'});}
$('angle').oninput=()=>g.command({type:'aim',angle:+$('angle').value,power:g.players[g.active].power});
$('restart').onclick=()=>{g.command({type:'restart'});r.version=-1;keys.clear();chargeOwner=null;};
for(const item of ['normal','burst','spread'])$('item-'+item).onclick=()=>g.command({type:'item',item});
const shoot=$('shoot');shoot.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();shoot.setPointerCapture(e.pointerId);startCharge(e.pointerId);};shoot.onpointerup=e=>releaseCharge(e.pointerId);shoot.onpointercancel=shoot.onlostpointercapture=e=>{if(chargeOwner===e.pointerId)interruptCharge();};
for(const [id,dir] of [['left',-1],['right',1]]){const b=$(id);b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(dir<0?'a':'d');};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(dir<0?'a':'d');}
window.onkeydown=e=>{if(e.code==='Space'){e.preventDefault();if(!e.repeat)startCharge('keyboard');return;}const mapped={KeyA:'a',KeyD:'d',KeyW:'w',KeyS:'s'}[e.code];if(mapped){e.preventDefault();keys.add(mapped);}};
window.onkeyup=e=>{keys.delete(({KeyA:'a',KeyD:'d',KeyW:'w',KeyS:'s'}[e.code])??e.key.toLowerCase());if(e.code==='Space'){e.preventDefault();releaseCharge('keyboard');}};
window.onblur=interruptCharge;document.addEventListener('visibilitychange',()=>{if(document.hidden)interruptCharge();last=0;acc=0;});
function tick(now){if(!last)last=now;acc+=Math.min((now-last)/1000,.1);last=now;while(acc>=DT){const p=g.players[g.active];if(keys.has('a'))g.command({type:'move',dx:-90*DT});if(keys.has('d'))g.command({type:'move',dx:90*DT});const da=(keys.has('w')?1:0)-(keys.has('s')?1:0);if(da)g.command({type:'elevation',delta:da*45*DT});g.step();acc-=DT;}
 if(g.phase!=='charging')chargeOwner=null;
 r.draw(g);const p=g.players[g.active],ready=g.phase==='aim',charging=g.phase==='charging';
 for(let i=0;i<2;i++){$('hp'+i).textContent=g.players[i].hp;$('bar'+i).style.width=g.players[i].hp+'%';}
 for(const item of ['normal','burst','spread']){const b=$('item-'+item);b.disabled=!ready;b.setAttribute('aria-pressed',String(g.item===item));}
 for(const id of ['angle','left','right'])$(id).disabled=!ready;shoot.disabled=!ready&&!charging;
 $('angle').value=p.angle;$('angleValue').textContent=Math.round(p.angle)+'°';
 $('powerValue').textContent=Math.round(g.charge)+'%';$('chargeFill').style.width=g.charge+'%';$('chargeMarker').style.left=g.charge+'%';$('chargeBar').setAttribute('aria-valuenow',String(Math.round(g.charge)));$('chargeBar').classList.toggle('returning',charging&&g.chargeDirection<0);
 $('chargeHint').textContent=charging?(g.chargeDirection>0?'蓄力增加 → 放開空白鍵發射':'← 蓄力回退！歸零前放開發射'):'按住空白鍵蓄力，放開發射';
 shoot.innerHTML=(charging?'放開發射':'按住蓄力')+'<span>放開發射 / SPACE</span>';
 $('fuel').textContent='移動能量 '+Math.round(g.fuel);$('turn').textContent='ROUND '+String(g.turn).padStart(2,'0');$('timer').textContent=Math.ceil(g.time);$('wind').textContent='風力 '+(g.wind===0?'靜風':(g.wind>0?'→ ':'← ')+Math.abs(g.wind));
 $('status').textContent=g.phase==='ended'?'對戰結束':g.notice|| (g.phase==='flight'?'炮彈飛行中':g.phase==='settling'?'等待角色落穩':charging?'蓄力中 · 放開發射':(g.active?'薄荷隊':'珊瑚隊')+'的回合');
 $('result').hidden=g.phase!=='ended';if(g.phase==='ended')$('result').innerHTML=(g.winner===-1?'平手！':(g.winner?'薄荷隊':'珊瑚隊')+'獲勝！')+'<small>按右上方「重新開局」再戰一場</small>';requestAnimationFrame(tick);
}requestAnimationFrame(tick);
