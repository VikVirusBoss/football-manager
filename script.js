* { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
body { background: #0a0e14; color: #fff; padding: 10px; }

.overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal { background: #1a2638; padding: 20px; border-radius: 15px; text-align: center; width: 100%; }
.match-event-overlay { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; pointer-events: none; font-size: 24px; font-weight: bold; color: #ffd700; text-align: center; text-shadow: 0 0 10px #000; }

.header { display: flex; justify-content: space-between; padding: 10px; background: #16202e; border-radius: 10px; margin-bottom: 10px; }
.nav { display: flex; gap: 5px; overflow-x: auto; margin-bottom: 10px; }
.nav-btn { flex: 1; padding: 8px; background: #1a2638; border: none; color: #fff; border-radius: 5px; white-space: nowrap; }
.nav-btn.active { background: #00e676; color: #000; }

.tab-content { display: none; }
.tab-content.active { display: block; }

.pitch { position: relative; width: 100%; height: 400px; background: #2e7d32; border: 2px solid #fff; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
.pitch::after { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: rgba(255,255,255,0.3); }

.card { width: 50px; background: #1a2638; border: 1px solid #333; padding: 5px; font-size: 8px; text-align: center; position: absolute; transform: translate(-50%, -50%); }
.player-avatar { width: 30px; height: 30px; border-radius: 50%; display: block; margin: 0 auto; background: #fff; }
.injury-mark { position: absolute; top: 0; right: 0; color: red; font-weight: bold; font-size: 14px; }

.squad-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 10px; }
.btn { background: #00e676; border: none; padding: 10px; border-radius: 5px; font-weight: bold; width: 100%; margin-top: 10px; }
.log-box { height: 100px; background: #000; font-size: 12px; overflow-y: scroll; padding: 5px; border: 1px solid #333; }
         
