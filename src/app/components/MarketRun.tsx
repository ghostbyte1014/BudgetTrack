import { useState } from 'react';

type Item = { id: string; name: string; price: number; qty: number; checked: boolean };
type Group = { id: string; vaultCategory: string; subCategory: string; items: Item[] };

export function MarketRun() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const warningLimit = 1400;
  const dangerLimit = 1900;
  
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 'g1',
      vaultCategory: 'Groceries',
      subCategory: '',
      items: []
    }
  ]);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  // Keypad
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<{ item: Item, groupId: string } | null>(null);
  const [activeMode, setActiveMode] = useState<'price' | 'qty'>('price');
  const [pStr, setPStr] = useState('0');
  const [qStr, setQStr] = useState('1');

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  // Derived Total (React calculates this passively, zero math bugs!)
  const runTotal = groups.reduce((acc, g) => acc + g.items.reduce((sum, i) => i.checked ? sum + (i.price * i.qty) : sum, 0), 0);
  const isRed = runTotal >= dangerLimit;
  const isAmber = runTotal >= warningLimit && !isRed;

  const goToScreen = (s: number) => {
    setCurrentScreen(s);
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const removeItem = (groupId: string, itemId: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== itemId) } : g));
  };

  const updateItemName = (groupId: string, itemId: string, newName: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, name: newName } : i) } : g));
  };

  const addGroup = () => {
    setGroups([...groups, {
      id: 'g_' + Date.now(),
      vaultCategory: 'Groceries',
      subCategory: '',
      items: []
    }]);
  };

  const updateGroup = (id: string, field: 'vaultCategory' | 'subCategory', value: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleAddKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, groupId: string) => {
    const val = inputs[groupId] || '';
    if (e.key === 'Enter' && val.trim() !== '') {
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, items: [...g.items, { id: 'i_' + Date.now(), name: val.trim(), price: 0, qty: 1, checked: false }] };
        }
        return g;
      }));
      setInputs({ ...inputs, [groupId]: '' });
    }
  };

  const handleFloorAdd = (e: React.KeyboardEvent<HTMLInputElement>, groupId: string) => {
    const val = inputs[`floor_${groupId}`] || '';
    if (e.key === 'Enter' && val.trim() !== '') {
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, items: [...g.items, { id: 'i_' + Date.now(), name: val.trim(), price: 0, qty: 1, checked: false }] };
        }
        return g;
      }));
      setInputs({ ...inputs, [`floor_${groupId}`]: '' });
    }
  };

  const handleToggleCheck = (group: Group, item: Item) => {
    if (item.checked) {
       // Uncheck it (unlocks item for editing)
       if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
       setGroups(groups.map(g => g.id === group.id ? { ...g, items: g.items.map(i => i.id === item.id ? { ...i, checked: false } : i) } : g));
    } else {
       // Stop check if there is no price
       if (item.price === 0) {
          openKeypad(item, group.id);
          return;
       }
       
       const hypotheticalTotal = runTotal + (item.price * item.qty);
       if (hypotheticalTotal >= dangerLimit && !isRed) {
         if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
       } else if (hypotheticalTotal >= warningLimit && !isAmber && !isRed) {
         if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
       } else {
         if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
       }
       setGroups(groups.map(g => g.id === group.id ? { ...g, items: g.items.map(i => i.id === item.id ? { ...i, checked: true } : i) } : g));
    }
  };

  const openKeypad = (item: Item, groupId: string) => {
    if (item.checked) return; // Locked items cannot be edited directly, must uncheck first!
    setActiveItem({ item, groupId });
    setPStr(item.price ? item.price.toString() : '0');
    setQStr(item.qty ? item.qty.toString() : '1');
    setActiveMode('price');
    setKeypadOpen(true);
  };

  const kp = (num: string) => {
    if (activeMode === 'price') {
      if (pStr === '0' && num !== '00') setPStr(num);
      else if (pStr !== '0') setPStr((p) => (p + num).slice(0, 5));
    } else {
      if (qStr === '1' || qStr === '0') setQStr(num);
      else setQStr((q) => (q + num).slice(0, 2));
    }
  };

  const kpBs = () => {
    if (activeMode === 'price') setPStr(pStr.slice(0, -1) || '0');
    else setQStr(qStr.slice(0, -1) || '0');
  };

  const checkOffItem = () => {
    const unitPrice = parseInt(pStr) || 0;
    const qty = parseInt(qStr) || 1;

    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(50);

    // Calculate hypothetical total just to trigger vibration bumps if necessary
    const hypotheticalTotal = groups.reduce((acc, g) => acc + g.items.reduce((sum, i) => {
       if (g.id === activeItem?.groupId && i.id === activeItem?.item.id) {
           return sum + (unitPrice * qty);
       }
       return i.checked ? sum + (i.price * i.qty) : sum;
    }, 0), 0);

    if (hypotheticalTotal >= dangerLimit && !isRed) {
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    } else if (hypotheticalTotal >= warningLimit && !isAmber && !isRed) {
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    setGroups(groups.map(g => {
      if (g.id === activeItem?.groupId) {
        return {
          ...g,
          items: g.items.map(i => i.id === activeItem.item.id ? { ...i, price: unitPrice, qty, checked: true } : i)
        };
      }
      return g;
    }));

    setKeypadOpen(false);
  };

  const syncVault = () => {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => {
        setSynced(false);
        setGroups([{
          id: 'g1',
          vaultCategory: 'Groceries',
          subCategory: '',
          items: []
        }]);
        goToScreen(0);
      }, 1200);
    }, 800);
  };



  return (
    <>
      <style>{`
        .mr-app-wrapper {
          --bg-dark: #0f1115;
          --bg-card: #1c1f26;
          --bg-sheet: #16181d;
          --text-main: #f3f4f6;
          --text-muted: #9ca3af;
          --primary: #3b82f6;
          --accent: #60a5fa;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --border: rgba(255,255,255,0.05);

          font-family: 'Inter', sans-serif;
          color: var(--text-main);
          background: var(--bg-dark);
          position: relative;
          height: calc(100vh - 6rem);
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid #333;
          margin: 0 auto;
          max-width: 800px;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .mr-app-wrapper { height: calc(100vh - 4.5rem); border-radius: 0; border: none; background: transparent; box-shadow: none; }
        }

        .mr-hero-banner {
           width: 100%; height: 200px;
           background-image: url('/market_run_hero.png');
           background-size: cover; background-position: center;
           position: relative;
        }
        .mr-hero-banner::after {
           content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
           background: linear-gradient(to top, var(--bg-dark), transparent);
        }
        @media (max-width: 768px) { .mr-hero-banner { height: 140px; } }

        .mr-slider-track {
          display: flex;
          width: 400%;
          height: 100%;
          transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .mr-screen {
          width: 25%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }
        .mr-scroll-body { flex: 1; overflow-y: auto; padding: 20px; scrollbar-width: none; box-sizing: border-box; }

        .mr-btn { background: var(--primary); color: white; padding: 18px; border: none; border-radius: 8px; font-weight: 700; font-size: 16px; width: 100%; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: transform 0.1s; box-sizing: border-box;}
        .mr-btn:active { transform: scale(0.97); }
        .mr-footer-dock { padding: 20px; background: var(--bg-dark); border-top: 1px solid var(--border); box-sizing: border-box;}
        
        .mr-header-hub { padding: 30px 20px 10px; position: relative; z-index: 10; margin-top: -80px; box-sizing: border-box;}
        .mr-header-standard { padding: 30px 20px 10px; box-sizing: border-box;}
        
        .mr-title { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 5px; text-shadow: 0 4px 20px rgba(0,0,0,0.8); }
        .mr-subhead { color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; margin-top: 20px;}

        @media (min-width: 768px) {
           .mr-scroll-body { padding: 0 40px 40px; }
           .mr-footer-dock { padding: 30px 40px; }
           .mr-header-hub { padding: 40px 40px 10px; margin-top: -100px;}
           .mr-header-standard { padding: 40px 40px 10px; }
        }

        .mr-card { background: var(--bg-card); padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-sizing: border-box;}
        .mr-card:active { background: #2a2d36; }
        .mr-c-title { font-weight: 600; font-size: 16px; color: white;}
        .mr-c-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: flex; gap: 8px; align-items: center;}
        .mr-badge { padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; text-transform: uppercase;}
        
        .mr-bp-input { background: transparent; border: none; font-size: 28px; font-weight: 800; color: white; width: 100%; outline: none; margin-bottom: 20px; box-sizing: border-box;}
        .mr-vault-sel { background: transparent; color: var(--primary); border: none; outline: none; font-weight: 700; font-size: 12px; cursor: pointer;}
        
        .mr-floor-header { padding: 25px 20px 15px; background: var(--success); color: #000; display: flex; flex-direction: column; transition: background 0.3s; position: relative; box-sizing: border-box;}
        @media (min-width: 768px) { .mr-floor-header { padding: 35px 40px 20px; } }
        .mr-floor-header.amber { background: var(--warning); color: #000; }
        .mr-floor-header.red { background: var(--danger); color: white; }
        .mr-fh-total { font-family: 'JetBrains Mono', monospace; font-size: 42px; font-weight: 800; line-height: 1; text-align: right;}
        
        .mr-kp { position: absolute; bottom: 0; left: 0; width: 100%; background: #0a0c10; border-radius: 16px 16px 0 0; padding: 24px; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1); z-index: 50; box-shadow: 0 -20px 50px rgba(0,0,0,0.8); box-sizing: border-box;}
        .mr-kp.active { transform: translateY(0); }
        .mr-kp-box { flex: 1; background: var(--bg-card); border: 2px solid transparent; border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; box-sizing: border-box;}
        .mr-kp-box.active { border-color: var(--primary); background: rgba(59,130,246,0.1);}
        .mr-kp-val { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 800;}
        .mr-kp-key { background: #222; color: white; border: none; border-radius: 8px; height: 60px; font-size: 24px; font-family: 'JetBrains Mono', monospace; font-weight: 600; cursor: pointer; box-sizing: border-box;}
        .mr-kp-key:active { background: #444; transform: scale(0.95);}
      `}</style>

      <div className="mr-app-wrapper">
        <div className="mr-slider-track" style={{ transform: `translateX(-${currentScreen * 25}%)` }}>
          
          {/* SCREEN 1: THE HUB */}
          <div className="mr-screen">
            <div className="mr-hero-banner"></div>
            <div className="mr-header-hub">
              <h1 className="mr-title">The Pantry</h1>
              <div style={{color:'var(--text-muted)', fontSize:'14px', marginBottom: '5px'}}>Variable Spend Margin</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:'24px', fontWeight:800, color:'var(--success)', textShadow:'0 2px 10px rgba(0,0,0,0.5)'}}>P4,250.00</div>
            </div>
            <div className="mr-scroll-body">
              <div className="mr-subhead">Draft & Active Runs</div>
              
              <div className="mr-card" onClick={() => goToScreen(2)}>
                <div>
                  <div className="mr-c-title">Weekend Groceries</div>
                  <div className="mr-c-meta">
                    <span className="mr-badge" style={{background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)'}}>ACTIVE • SHOPPING</span>
                    <span>Today</span>
                  </div>
                </div>
                <div className="mr-amount" style={{fontFamily:"'JetBrains Mono', monospace", fontWeight:700, fontSize:'16px', color:'var(--success)'}}>P{runTotal.toLocaleString()}.00</div>
              </div>
              
              <div className="mr-card" onClick={() => goToScreen(1)}>
                <div>
                  <div className="mr-c-title">Target Run</div>
                  <div className="mr-c-meta">
                    <span className="mr-badge" style={{background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent)'}}>DRAFT</span>
                    <span>{groups.reduce((acc, g) => acc + g.items.length, 0)} Items</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mr-footer-dock">
              <button className="mr-btn" onClick={() => goToScreen(1)}>+ Start New Run</button>
            </div>
          </div>

          {/* SCREEN 2: THE BLUEPRINT */}
          <div className="mr-screen">
            <div className="mr-header-standard">
              <div style={{color:'var(--text-muted)', marginBottom:'20px', fontSize:'14px', fontWeight:700, cursor:'pointer'}} onClick={() => goToScreen(0)}>← Back to Hub</div>
              <input type="text" className="mr-bp-input" placeholder="Name this run..." defaultValue="Target Run" />
            </div>
            <div className="mr-scroll-body" style={{paddingTop: 0}}>
              {groups.map(group => (
                <div key={group.id} style={{background:'var(--bg-card)', borderRadius:'12px', border:'1px solid var(--border)', overflow:'hidden', marginBottom:'20px'}}>
                  <div style={{background:'rgba(0,0,0,0.3)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', fontWeight:600, color:'var(--text-muted)', borderBottom:'1px solid var(--border)'}}>
                    <div>VAULT CATEGORY</div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <select className="mr-vault-sel" value={group.vaultCategory} onChange={(e) => updateGroup(group.id, 'vaultCategory', e.target.value)}>
                        <option>Groceries</option>
                        <option>Dining</option>
                        <option>Transportation</option>
                        <option>Entertainment</option>
                        <option>Shopping</option>
                        <option>Healthcare</option>
                        <option>Utilities</option>
                        <option>Other</option>
                      </select>
                      <span style={{color:'var(--danger)', cursor:'pointer', fontSize:'16px', fontWeight:'bold', opacity:0.8}} onClick={() => removeGroup(group.id)}>✕</span>
                    </div>
                  </div>
                  <div style={{padding:'16px', borderBottom:'1px solid var(--border)'}}>
                    <input type="text" value={group.subCategory} onChange={(e) => updateGroup(group.id, 'subCategory', e.target.value)} style={{background:'transparent', border:'none', fontSize:'18px', fontWeight:700, color:'white', width:'100%', outline:'none', boxSizing: 'border-box'}} placeholder="Sub-category (e.g. Cleaning Tools)" />
                  </div>
                  
                  {group.items.map(item => (
                    <div key={item.id} style={{display:'flex', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid var(--border)'}}>
                      <span style={{color:'#555', marginRight:'12px', fontSize:'20px'}}>≡</span>
                      <input 
                        style={{flex:1, fontWeight:500, background:'transparent', border:'none', color:'white', outline:'none', fontSize:'16px', boxSizing:'border-box'}} 
                        value={item.name}
                        onChange={(e) => updateItemName(group.id, item.id, e.target.value)}
                      />
                      <span style={{color:'var(--danger)', cursor:'pointer', marginLeft:'12px', fontSize:'16px', fontWeight:'bold', opacity:0.8}} onClick={() => removeItem(group.id, item.id)}>✕</span>
                    </div>
                  ))}
                  
                  <div style={{padding:'16px', display:'flex', gap:'12px', alignItems:'center'}}>
                    <span style={{color:'var(--primary)', fontWeight:'bold', fontSize:'20px'}}>+</span>
                    <input 
                      type="text" 
                      placeholder="Add expected item..." 
                      style={{background:'transparent', border:'none', color:'white', fontSize:'16px', width:'100%', outline:'none', boxSizing: 'border-box'}} 
                      value={inputs[group.id] || ''}
                      onChange={(e) => setInputs({...inputs, [group.id]: e.target.value})}
                      onKeyDown={(e) => handleAddKeyPress(e, group.id)}
                    />
                  </div>
                </div>
              ))}

              <div style={{marginTop:'10px', background:'transparent', border:'2px dashed #333', color:'var(--text-muted)', padding:'16px', borderRadius:'12px', fontWeight:700, textAlign:'center', cursor:'pointer'}} onClick={addGroup}>
                + Add Another Vault Category
              </div>
            </div>
            <div className="mr-footer-dock">
              <button className="mr-btn" style={{background:'white', color:'black'}} onClick={() => goToScreen(2)}>Lock Blueprint & Go ➔</button>
            </div>
          </div>

          {/* SCREEN 3: THE FLOOR */}
          <div className="mr-screen">
            <div className={`mr-floor-header ${isRed ? 'red' : isAmber ? 'amber' : ''}`}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                <div style={{fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:0.8}} onClick={() => goToScreen(1)}>← Edit Blueprint</div>
                <div style={{fontSize:'12px', fontWeight:700, opacity:0.8, textTransform:'uppercase'}}>Daily Limit: P2,000</div>
              </div>
              <div className="mr-fh-total">P{runTotal.toLocaleString()}.00</div>
            </div>
            
            <div className="mr-scroll-body" style={{paddingTop: '20px'}}>
              {groups.map(group => (
                <div key={group.id} style={{background:'var(--bg-card)', borderRadius:'12px', marginBottom:'24px', border:'1px solid var(--border)', overflow:'hidden'}}>
                  
                  <div style={{background:'#222', borderBottom:'1px solid #333', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'14px', fontWeight:600}}>
                    <span style={{color:'white'}}>{group.vaultCategory}{group.subCategory ? `: ${group.subCategory}` : ''}</span>
                    <span style={{color:'var(--text-muted)'}}>{group.items.filter(i=>i.checked).length}/{group.items.length}</span>
                  </div>

                  {group.items.map(item => (
                    <div key={item.id} style={{display:'flex', alignItems:'center', padding:'16px 16px', borderBottom:'1px solid #333', background: item.checked ? 'rgba(0,0,0,0.2)' : 'transparent', transition: 'background 0.2s'}}>
                      
                      {/* Check/Radio Button */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleToggleCheck(group, item); }}
                        style={{width:'24px', height:'24px', borderRadius:'50%', border: item.checked ? 'none' : '2px solid var(--text-muted)', background: item.checked ? 'var(--primary)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginRight:'15px', flexShrink: 0}}
                      >
                         {item.checked && <span style={{color:'white', fontSize:'14px', fontWeight:'bold'}}>✓</span>}
                      </div>

                      {/* Body -> Opens Keypad ONLY IF UNCHECKED */}
                      <div style={{flex:1, cursor: item.checked ? 'default' : 'pointer'}} onClick={() => openKeypad(item, group.id)}>
                        <div style={{fontWeight:500, textDecoration: item.checked ? 'line-through' : 'none', opacity: item.checked ? 0.6 : 1, transition:'opacity 0.2s'}}>{item.name}</div>
                        {(item.price > 0 || item.qty > 1) && (
                          <div style={{fontSize:'12px', color:'var(--primary)', fontWeight:700, marginTop:'4px', opacity: item.checked ? 0.6 : 1}}>
                            {item.qty}x P{item.price}
                          </div>
                        )}
                      </div>

                      {/* Price trailing */}
                      <div style={{fontWeight:700, fontFamily:"'JetBrains Mono', monospace", opacity: item.checked ? 0.6 : 1, color: item.checked ? 'var(--success)' : 'var(--text-muted)'}}>
                        {item.checked ? `P${item.price * item.qty}` : item.price > 0 ? `P${item.price * item.qty}` : 'TAP →'}
                      </div>

                    </div>
                  ))}
                  
                  {group.items.length === 0 && (
                    <div style={{padding:'16px', color:'#666', fontSize:'13px', textAlign:'center', fontStyle:'italic'}}>Empty Category.</div>
                  )}

                  {/* Per Container Add */}
                  <div style={{padding:'16px', display:'flex', gap:'12px', alignItems:'center', background: 'rgba(255,255,255,0.01)'}}>
                    <span style={{color:'var(--primary)', fontWeight:'bold', fontSize:'20px'}}>+</span>
                    <input 
                      type="text" 
                      placeholder="Add missed item here..." 
                      style={{background:'transparent', border:'none', color:'white', fontSize:'14px', width:'100%', outline:'none', boxSizing: 'border-box'}} 
                      value={inputs[`floor_${group.id}`] || ''}
                      onChange={(e) => setInputs({...inputs, [`floor_${group.id}`]: e.target.value})}
                      onKeyDown={(e) => handleFloorAdd(e, group.id)}
                    />
                  </div>

                </div>
              ))}
            </div>
            
            <div className="mr-footer-dock">
              <button className="mr-btn" style={{background:'white', color:'black'}} onClick={() => goToScreen(3)}>Checkout & Review ➔</button>
            </div>

            {/* KEYPAD */}
            <div className={`mr-kp ${keypadOpen ? 'active' : ''}`}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
                <div style={{fontSize:'20px', fontWeight:700}}>{activeItem?.item.name}</div>
                <div style={{fontSize:'24px', color:'#555', cursor:'pointer'}} onClick={() => setKeypadOpen(false)}>✕</div>
              </div>
              
              <div style={{display:'flex', gap:'12px', marginBottom:'20px'}}>
                <div className={`mr-kp-box ${activeMode==='price' ? 'active' : ''}`} onClick={() => setActiveMode('price')}>
                  <div style={{fontSize:'11px', fontWeight:700, color:'#888', marginBottom:'4px', textTransform:'uppercase'}}>Price (P)</div>
                  <div className="mr-kp-val">{pStr}</div>
                </div>
                <div className={`mr-kp-box ${activeMode==='qty' ? 'active' : ''}`} onClick={() => setActiveMode('qty')}>
                  <div style={{fontSize:'11px', fontWeight:700, color:'#888', marginBottom:'4px', textTransform:'uppercase'}}>Qty</div>
                  <div className="mr-kp-val">{qStr}</div>
                </div>
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'16px'}}>
                {['1','2','3','4','5','6','7','8','9'].map(n => (
                  <button key={n} className="mr-kp-key" onClick={() => kp(n)}>{n}</button>
                ))}
                <button className="mr-kp-key" style={{background:'#111', fontSize:'18px'}} onClick={() => kp('00')}>00</button>
                <button className="mr-kp-key" onClick={() => kp('0')}>0</button>
                <button className="mr-kp-key" style={{background:'#111', fontSize:'18px'}} onClick={kpBs}>⌫</button>
              </div>
              <button className="mr-btn" style={{height:'64px', fontSize:'18px'}} onClick={checkOffItem}>Calculate & Next</button>
            </div>
          </div>

          {/* SCREEN 4: THE RECEIPT */}
          <div className="mr-screen">
            <div className="mr-scroll-body" style={{textAlign:'center', paddingTop:'30px'}}>
              <div style={{fontSize:'12px', fontWeight:700, color:'var(--text-muted)', letterSpacing:'2px', textTransform:'uppercase'}}>Final Total</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:'56px', fontWeight:800, margin:'10px 0 30px', color: isRed ? 'var(--danger)' : isAmber ? 'var(--warning)' : 'var(--success)'}}>
                P{runTotal.toLocaleString()}.00
              </div>
              
              <div style={{textAlign:'left', fontSize:'16px', fontWeight:700, marginBottom:'15px'}}>Vault Categorization</div>
              <div style={{height:'16px', borderRadius:'8px', display:'flex', overflow:'hidden', marginBottom:'15px', background:'#222'}}>
                <div style={{width: currentScreen===3 ? '75%' : '0%', background:'var(--primary)', transition:'width 1s ease'}}></div>
                <div style={{width: currentScreen===3 ? '25%' : '0%', background:'var(--warning)', transition:'width 1s ease'}}></div>
              </div>
              
              <textarea style={{background:'var(--bg-card)', border:'1px solid var(--border)', padding:'20px', borderRadius:'8px', color:'white', fontSize:'15px', width:'100%', outline:'none', height:'120px', resize:'none', marginTop:'20px', boxSizing:'border-box'}} placeholder="Field Note..."></textarea>
            </div>
            
            <div className="mr-footer-dock">
              <button 
                className="mr-btn" 
                style={{background:'var(--success)', color:'#000', opacity: syncing ? 0.8 : 1}} 
                onClick={syncVault}
              >
                {synced ? '✓ Vault Secured' : syncing ? 'Syncing...' : 'Sync to Vault ✓'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
