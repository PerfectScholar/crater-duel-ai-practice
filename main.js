import {BattleAudio} from './audio.js';
import {Game,DT,MAX_HP,SHOT_CONFIG,launchSpeed} from './core/game.js';import {ITEM_DEFINITIONS,ITEM_TYPES} from './core/items.js';import {Renderer} from './render.js';
const audio=new BattleAudio();
const g=new Game(),r=new Renderer(document.querySelector('canvas')),$=id=>document.getElementById(id),keys=new Set();let last=0,acc=0,chargeOwner=null;
window.addEventListener('pointerdown',()=>audio.unlock(),{capture:true});
window.addEventListener('keydown',()=>audio.unlock(),{capture:true});
window.addEventListener('blur',()=>audio.pause());
window.addEventListener('focus',()=>{if(audio.ctx)audio.unlock();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();else if(audio.ctx)audio.unlock();});
$('sound-toggle').onclick=()=>{audio.setMuted(!audio.muted);$('sound-toggle').textContent=audio.muted?'音效：關':'音效：開';$('sound-toggle').setAttribute('aria-pressed',String(!audio.muted));};
$('sound-volume').oninput=()=>{audio.setVolume(Number($('sound-volume').value)/100);$('volume-value').textContent=$('sound-volume').value+'%';};
function startCharge(owner){if(chargeOwner!==null)return;if(g.command({type:'charge'}))chargeOwner=owner;}
function releaseCharge(owner){if(chargeOwner!==owner)return;chargeOwner=null;g.command({type:'release'});}
function interruptCharge(){chargeOwner=null;keys.clear();g.command({type:'cancelCharge'});}
$('angle').oninput=()=>g.command({type:'aim',angle:+$('angle').value,power:g.players[g.active].power});
$('pass').onclick=()=>{if(g.command({type:'pass'})){chargeOwner=null;keys.clear();}};
$('restart').onclick=()=>{g.command({type:'restart'});r.version=-1;keys.clear();chargeOwner=null;};
for(const item of ITEM_TYPES){const definition=ITEM_DEFINITIONS[item],button=document.createElement('button'),shortcut=ITEM_TYPES.indexOf(item)+1;button.id='item-'+item;button.setAttribute('aria-pressed','false');button.setAttribute('aria-keyshortcuts',String(shortcut));button.title=definition.label+'（'+shortcut+'，使用後不可取消）';const key=document.createElement('kbd');key.textContent=shortcut;const icon=document.createElement('img');icon.className='item-icon';icon.alt='';icon.src=new URL('./assets/'+definition.image,import.meta.url).href;const label=document.createElement('span');label.textContent=definition.label;button.append(key,icon,label);button.onclick=()=>g.command({type:'item',item});document.querySelector('.items').append(button);}
const shoot=$('shoot');shoot.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();shoot.setPointerCapture(e.pointerId);startCharge(e.pointerId);};shoot.onpointerup=e=>releaseCharge(e.pointerId);shoot.onpointercancel=shoot.onlostpointercapture=e=>{if(chargeOwner===e.pointerId)interruptCharge();};
const tuningIds=['tune-gamma','tune-min','tune-max','tune-fast','tune-reset'];
const tuningDefaults={...SHOT_CONFIG};
function syncTuning(){
 for(const [key,id,label] of [['gamma','tune-gamma','gammaValue'],['minSpeed','tune-min','minSpeedValue'],['maxSpeed','tune-max','maxSpeedValue']]){$(id).value=SHOT_CONFIG[key];$(label).textContent=SHOT_CONFIG[key];}
}
for(const [key,id] of [['gamma','tune-gamma'],['minSpeed','tune-min'],['maxSpeed','tune-max']])$(id).oninput=()=>{if(g.phase!=='aim')return;SHOT_CONFIG[key]=Number($(id).value);syncTuning();};
$('tune-fast').onclick=()=>{if(g.phase!=='aim')return;Object.assign(SHOT_CONFIG,{gamma:2.2,minSpeed:200,maxSpeed:4000});syncTuning();};
$('tune-reset').onclick=()=>{if(g.phase!=='aim')return;Object.assign(SHOT_CONFIG,tuningDefaults);syncTuning();};
syncTuning();
const itemTypes=ITEM_TYPES;
window.onkeydown=e=>{const digit=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(digit){const item=itemTypes[Number(digit[1])-1];if(item){e.preventDefault();if(!e.repeat)g.command({type:'item',item});}return;}if(e.code==='Space'){e.preventDefault();if(!e.repeat){if(g.phase==='flight')g.command({type:'activateFlightItem',item:'gravity'});else startCharge('keyboard');}return;}const mapped={KeyA:'a',KeyD:'d',KeyW:'w',KeyS:'s'}[e.code];if(mapped){e.preventDefault();keys.add(mapped);}};
window.onkeyup=e=>{keys.delete(({KeyA:'a',KeyD:'d',KeyW:'w',KeyS:'s'}[e.code])??e.key.toLowerCase());if(e.code==='Space'){e.preventDefault();releaseCharge('keyboard');}};
window.onblur=interruptCharge;document.addEventListener('visibilitychange',()=>{if(document.hidden)interruptCharge();last=0;acc=0;});
function movementInput(){return (keys.has('d')?1:0)-(keys.has('a')?1:0);}
function tick(now){if(!last)last=now;acc+=Math.min((now-last)/1000,.1);last=now;while(acc>=DT){const p=g.players[g.active];const move=movementInput();if(move)g.command({type:'move',dx:move*90*DT});const da=(keys.has('w')?1:0)-(keys.has('s')?1:0);if(da)g.command({type:'elevation',delta:da*45*DT});g.step();r.characters.animator.update(g,DT,{move});acc-=DT;}
 r.characters.animator.update(g,0,{move:movementInput()});
 if(g.phase!=='charging')chargeOwner=null;
 audio.sync(g);
 r.draw(g);const p=g.players[g.active],ready=g.phase==='aim',charging=g.phase==='charging';
 for(let i=0;i<2;i++){$('hp'+i).textContent=g.players[i].hp;$('bar'+i).style.width=(g.players[i].hp/MAX_HP*100)+'%';}
 for(const item of ITEM_TYPES){const b=$('item-'+item);b.disabled=!ready||g.items.has(item);b.setAttribute('aria-pressed',String(g.items.has(item)));}
 for(const id of tuningIds)$(id).disabled=!ready;
 $('pass').disabled=!ready&&!charging;
 document.querySelector('.timer').classList.toggle('urgent',g.time>0&&g.time<=10);
 $('speedPreview').textContent=Math.round(launchSpeed(g.charge/100));
 for(const id of ['angle'])$(id).disabled=!ready;shoot.disabled=!ready&&!charging;
 $('angle').value=p.angle;$('angleValue').textContent=Math.round(p.angle)+'°';
 $('powerValue').textContent=Math.round(g.charge)+'%';$('chargeFill').style.width=g.charge+'%';$('chargeMarker').style.left=g.charge+'%';$('chargeBar').setAttribute('aria-valuenow',String(Math.round(g.charge)));$('chargeBar').classList.toggle('returning',charging&&g.chargeDirection<0);
 $('chargeHint').textContent=g.phase==='flight'&&g.items.has('gravity')?(g.usedFlightItems.has('gravity')?'重力下墜已觸發：鎖定落點':'再按一次空白鍵：重力下墜（一次）'):charging?(g.chargeDirection>0?'蓄力增加 → 放開空白鍵發射':'← 蓄力回退！歸零前放開發射'):'按住空白鍵蓄力，放開發射';
 shoot.innerHTML=(charging?'放開發射':'按住蓄力')+'<span>放開發射 / SPACE</span>';
 $('fuel').textContent='移動能量 '+Math.round(g.fuel);$('turn').textContent='ROUND '+String(g.turn).padStart(2,'0');$('timer').textContent=Math.ceil(g.time);$('wind').textContent='風力 '+(g.wind===0?'靜風':(g.wind>0?'→ ':'← ')+Math.abs(g.wind));
 $('status').textContent=g.phase==='ended'?'對戰結束':g.notice|| (g.phase==='flight'?'炮彈飛行中':g.phase==='settling'?'等待角色落穩':charging?'蓄力中 · 放開發射':(g.active?'薄荷隊':'珊瑚隊')+'的回合');
 $('result').hidden=g.phase!=='ended';if(g.phase==='ended')$('result').innerHTML=(g.winner===-1?'平手！':(g.winner?'薄荷隊':'珊瑚隊')+'獲勝！')+'<small>按右上方「重新開局」再戰一場</small>';requestAnimationFrame(tick);
}requestAnimationFrame(tick);
