import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {AnimateUIProvider} from '@animate-ui/react/provider';
import {motion} from 'motion/react';
import {Settings,Search,ArrowRight,CalendarDays,Sun,Globe2} from 'lucide-react';
import {Brand,FeatureTiles,ToolModal,useConfig,VERSION} from './fullscreen';
import {searchEngines} from './store';
import './glass.css';
function NewTab(){
 const [config,setConfig]=useConfig(),[active,setActive]=useState(null),[now,setNow]=useState(new Date()),[query,setQuery]=useState('');
 useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape')setActive(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const search=e=>{e.preventDefault();const raw=query.trim();if(!raw)return;if(/^https?:\/\//i.test(raw)){location.href=raw}else if(/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(raw)){location.href='https://'+raw}else{location.href=searchEngines[config.search]+encodeURIComponent(raw)}};
 const date=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(now);
 const time=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(now);
 return <AnimateUIProvider><div className="full-page glass-experience newtab-glass">
  <div className="full-shade"/><div className="glass-grain" aria-hidden="true"/>
  <header className="glass-topline"><span className="glass-topline-brand"><span className="topline-dot"/> SBC START</span><button className="glass-settings" onClick={()=>setActive('settings')} aria-label="Open settings"><Settings size={18}/></button></header>
  <main className="glass-layout">
   <motion.section className="glass-shell glass-tab-shell" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}}>
    <div className="glass-shell-light" aria-hidden="true"/>
    <div className="glass-product-mark"><Brand/></div>
    <div className="glass-tab-date"><CalendarDays size={15}/>{date}</div>
    <div className="glass-time" role="timer">{time}</div>
    <p className="glass-greeting">{now.getHours()<12?'Good morning':now.getHours()<18?'Good afternoon':'Good evening'}{config.name?', '+config.name:''}<span>.</span></p>
    <form className="glass-search" onSubmit={search}><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search the web" placeholder="Search or enter a web address"/><button type="submit" aria-label="Go"><ArrowRight size={19}/></button></form>
    <div className="glass-tab-hint">Your day. Your pace. Your space.</div>
   </motion.section>
   <div className="glass-dock-wrap"><div className="glass-dock-title"><span/> YOUR WORKSPACE <span/></div><FeatureTiles onClick={setActive}/></div>
  </main>
  <footer className="glass-footer"><span>SBC Start · v{VERSION}</span><span>Made by Senior Block Chain LLC</span></footer>
  <ToolModal active={active} close={()=>setActive(null)} config={config} setConfig={setConfig}/>
 </div></AnimateUIProvider>
}
createRoot(document.getElementById('root')).render(<NewTab/>);
