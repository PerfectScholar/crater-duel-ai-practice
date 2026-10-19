// Each selected modifier contributes to the same salvo. Add future items here.
export const ITEM_DEFINITIONS={
 combo:{label:'連擊',image:'yellow-plus1.png',extraVolleys:1},
 burst:{label:'二連擊',image:'red-plus2.png',extraVolleys:2},
 spread:{label:'三叉彈',image:'blue-triple-shot.png',offsets:[-9,0,9]},
 gravity:{label:'重力下墜',image:'gravity-drop.png',flightEffect:'gravityDrop'}
};
export const ITEM_TYPES=Object.keys(ITEM_DEFINITIONS);
export function salvoFor(items){
 let volleys=1,offsets=[0];
 for(const id of items){const item=ITEM_DEFINITIONS[id];volleys+=item.extraVolleys??0;if(item.offsets)offsets=offsets.flatMap(base=>item.offsets.map(offset=>base+offset));}
 return {volleys,offsets};
}
