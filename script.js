let m = 25;
let s = 0;
let fM = 25;
let bM = 5;
let run = false;
let mode = 'focus';
let intvl, idlTmr, visTmr;
let synth;

const el = id => document.getElementById(id);
const time = el('time');
const modeEl = el('mode');
const msg = el('msg');
const startBtn = el('start');
const pauseBtn = el('pause');
const resetBtn = el('reset');

function init() {
    if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }
    synth = new Tone.Synth().toDestination();
}

function updD() {
    time.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    document.title = `${time.textContent} - ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
}

function playSnd() {
    if (!synth) init();
    try {
        synth.triggerAttackRelease("C5", "0.5s");
    } catch (e) {
        // Failsafe
    }
}

function showNotif(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: './favicon.ico' });
    }
}

function reqPerm() {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

function rstIdlTmr() {
    clearTimeout(idlTmr);
    if (run && mode === 'focus') {
        idlTmr = setTimeout(() => {
            msg.textContent = "Are you still there?";
            showNotif("Still there?", "Timer is paused. Click to resume.");
            pause();
        }, 120000);
    }
}

function tick() {
    if (!run) return;
    if (s === 0) {
        if (m === 0) {
            playSnd();
            if (mode === 'focus') {
                mode = 'break';
                m = bM;
                modeEl.textContent = 'Break';
                showNotif("Time's up!", "Time for a 5-minute break.");
            } else {
                mode = 'focus';
                m = fM;
                modeEl.textContent = 'Focus';
                showNotif("Break's over!", "Time to get back to focus.");
            }
        } else {
            m--;
            s = 59;
        }
    } else {
        s--;
    }
    updD();
    rstIdlTmr();
}

function start() {
    if (run) return;
    if (!synth) init();
    reqPerm();
    run = true;
    intvl = setInterval(tick, 1000);
    startBtn.textContent = 'Running...';
    msg.textContent = "";
    rstIdlTmr();
}

function pause() {
    run = false;
    clearInterval(intvl);
    clearTimeout(idlTmr);
    startBtn.textContent = 'Start';
}

function reset() {
    pause();
    mode = 'focus';
    m = fM;
    s = 0;
    updD();
    modeEl.textContent = 'Focus';
    msg.textContent = "";
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden && run && mode === 'focus') {
        visTmr = setTimeout(() => {
            msg.textContent = "Don't get distracted!";
            showNotif("Distraction Alert", "Get back to your focus session!");
        }, 5000);
    } else {
        clearTimeout(visTmr);
        if (!document.hidden && run) {
            msg.textContent = "";
        }
    }
});

startBtn.onclick = start;
pauseBtn.onclick = pause;
resetBtn.onclick = reset;
['mousemove', 'mousedown', 'keydown'].forEach(e => document.addEventListener(e, rstIdlTmr));

updD();
