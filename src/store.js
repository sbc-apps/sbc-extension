const KEY='sbc-start-settings-v1';
export const defaults={name:'',city:'Muscat',lat:23.588,lon:58.383,unit:'celsius',theme:'dark',search:'google',widgets:{market:true,weather:true,tasks:true,links:true,focus:true,calendar:true,world:true},tasks:[],links:[{id:'github',label:'GitHub',url:'https://github.com'},{id:'mail',label:'Mail',url:'https://mail.google.com'},{id:'sbc',label:'SBC',url:'https://sbc.om'}]};
export function load(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');return {...defaults,...saved,widgets:{...defaults.widgets,...(saved.widgets||{})},tasks:Array.isArray(saved.tasks)?saved.tasks:[],links:Array.isArray(saved.links)?saved.links:defaults.links};}catch{return defaults;}}
export function save(data){localStorage.setItem(KEY,JSON.stringify(data));}
export const searchEngines={google:'https://www.google.com/search?q=',duckduckgo:'https://duckduckgo.com/?q=',bing:'https://www.bing.com/search?q='};
