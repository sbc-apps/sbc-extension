import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {AnimateUIProvider} from '@animate-ui/react/provider';
import {motion} from 'motion/react';
import {ArrowDownToLine,ArrowUpRight,Download,Github,ShieldCheck,Globe2,ChevronRight} from 'lucide-react';
import {Brand,FeatureTiles,ToolModal,useConfig,RELEASE,VERSION} from './fullscreen';
import './glass.css';
const git='https://github.com/sbc-apps/sbc-extension';
function Landing(){
 const [active,setActive]=useState(null),[config,setConfig]=useConfig();
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setActive(null)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 return <AnimateUIProvider><div className="full-page glass-experience landing-glass">
  <div className="full-shade"/><div className="glass-grain" aria-hidden="true"/>
  <header className="glass-topline"><span className="glass-topline-brand"><span className="topline-dot"/> SBC START</span><a href={git} target="_blank" rel="noopener noreferrer" className="glass-topline-link"><Github size={16}/> Open source <ArrowUpRight size={15}/></a></header>
  <main className="glass-layout">
   <motion.section className="glass-shell glass-landing-shell" initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.65,ease:[.2,.8,.2,1]}}>
    <div className="glass-shell-light" aria-hidden="true"/>
    <div className="glass-product-mark"><Brand/></div>
    <div className="glass-rule"/>
    <div className="glass-product-intro"><span className="glass-eyebrow"><span className="glass-live-dot"/> YOUR SPACE, ONE TAB</span><h1>Simply a better<br/><em>place to begin.</em></h1><p>Everything that matters, beautifully in reach.</p></div>
    <div className="glass-actions"><a className="glass-primary" href={RELEASE}><Download size={18}/> Get SBC Start <ChevronRight size={17}/></a><a className="glass-secondary" href={git} target="_blank" rel="noopener noreferrer"><Github size={17}/> Source code</a></div>
    <div className="glass-browser-heading"><span>CHOOSE YOUR BROWSER</span><span>VERSION {VERSION}</span></div>
    <div className="glass-browser-row">
      <a href="https://github.com/sbc-apps/sbc-extension/releases/latest" aria-label="Get SBC Start for Chrome" className="glass-browser"><span className="browser-symbol chrome">◉</span><b>Chrome</b></a>
      <a href="https://github.com/sbc-apps/sbc-extension/releases/latest" aria-label="Get SBC Start for Edge" className="glass-browser"><span className="browser-symbol edge">e</span><b>Edge</b></a>
      <a href="https://github.com/sbc-apps/sbc-extension/releases/latest" aria-label="Get SBC Start for Brave" className="glass-browser"><span className="browser-symbol brave">♜</span><b>Brave</b></a>
      <a href="https://github.com/sbc-apps/sbc-extension/releases/latest" aria-label="Get SBC Start for Firefox" className="glass-browser"><span className="browser-symbol firefox">◉</span><b>Firefox</b></a>
    </div>
    <div className="glass-shell-caption"><ShieldCheck size={14}/> Personal tasks and settings stay on your device</div>
   </motion.section>
   <div className="glass-dock-wrap"><div className="glass-dock-title"><span/> EXPLORE THE TOOLS <span/></div><FeatureTiles onClick={setActive}/></div>
  </main>
  <footer className="glass-footer"><span>© {new Date().getFullYear()} Senior Block Chain LLC</span><div><a href="https://sbc.om/brand/" target="_blank" rel="noopener noreferrer">SBC Brand</a><a href={RELEASE}>Downloads <ArrowUpRight size={12}/></a></div></footer>
  <ToolModal active={active} close={()=>setActive(null)} config={config} setConfig={setConfig}/>
 </div></AnimateUIProvider>
}
createRoot(document.getElementById('root')).render(<Landing/>);
