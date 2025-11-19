
export default function Sidebar({ view, setView }){
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">AI</div>
        <div>
          <div style={{fontWeight:700}}>My AI</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Personal assistant</div>
        </div>
      </div>

      <nav className="nav" style={{marginTop:12}}>
        <button className={`btn ${view==='chat' ? 'active' : ''}`} onClick={()=>setView('chat')}>
          💬 Chat
        </button>
        <button className={`btn ${view==='admin' ? 'active' : ''}`} onClick={()=>setView('admin')}>
          🗂️ Admin DB
        </button>
      </nav>

      <div style={{marginTop:'auto', fontSize:13, color:'var(--muted)'}}>
        <div>Tip: Put your personal docs in Admin → they will be used in answers.</div>
      </div>
    </aside>
  );
}
