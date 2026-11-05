(() => {
  const $ = (id) => document.getElementById(id);
  const hands = { rock: '✊', paper: '✋', scissors: '✌' };
  const names = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  const princessLines = {
    win: ['A clever move! You have my attention.', 'Nicely played. The night is young!', 'You caught me off guard—well done!'],
    loss: ['A royal victory! Shall we go again?', 'My move! You nearly had me.', 'A point for the crown. Your turn!'],
    tie: ['Great minds think alike. Again!', 'A tie! Fate wants another round.', 'We matched—let’s try once more.']
  };
  let player = 0, princess = 0, round = 1, level = 0, locked = false, soundOn = false;
  let best = Number(localStorage.getItem('moonlit-best') || 0);
  $('bestScore').textContent = best;

  function tone(freq, duration = .12) {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(.055, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + duration);
      oscillator.onended = () => ctx.close();
    } catch (_) { /* Audio is an optional enhancement. */ }
  }
  function updateScore() {
    $('playerScore').textContent = player;
    $('princessScore').textContent = princess;
    $('roundLabel').textContent = `ROUND ${round}`;
  }
  function choose(choice) {
    if (locked) return;
    const keys = Object.keys(hands), reply = keys[Math.floor(Math.random() * keys.length)];
    $('playerHand').textContent = hands[choice];
    $('princessHand').textContent = hands[reply];
    $('duelBox').classList.remove('won', 'lost', 'tie');
    $('playerHand').animate([{transform:'translateY(7px) scale(.8)'},{transform:'translateY(0) scale(1)'}], {duration:230, easing:'ease-out'});
    $('princessHand').animate([{transform:'translateY(-7px) scale(.8)'},{transform:'translateY(0) scale(1)'}], {duration:230, easing:'ease-out'});
    if (choice === reply) {
      $('duelBox').classList.add('tie');
      $('result').textContent = `It’s a tie — ${names[choice]}!`;
      $('quip').textContent = `“${princessLines.tie[Math.floor(Math.random() * 3)]}”`;
      $('hint').textContent = 'No point this time. Choose again!'; tone(430);
      return;
    }
    round++;
    const won = beats[choice] === reply;
    if (won) {
      player++; level = Math.min(3, level + 1);
      $('duelBox').classList.add('won');
      $('result').textContent = `${names[choice]} beats ${names[reply]} — you win!`;
      $('quip').textContent = `“${princessLines.win[Math.floor(Math.random() * 3)]}”`;
      $('hint').textContent = level < 3 ? 'A new royal look revealed!' : 'You’re one step closer to the crown!';
      $('princess').className.baseVal = `princess level-${level}`;
      $('wardrobeCount').textContent = `${level} / 3`;
      $('progressFill').style.width = `${level * 33.333}%`;
      $('outfitLabel').textContent = ['ROYAL BALL GOWN', 'VELVET EVENING LOOK', 'MIDNIGHT COURT ENSEMBLE', 'MOONLIT VICTORY LOOK'][level];
      tone(660, .15); setTimeout(() => tone(880, .18), 90);
    } else {
      princess++; $('duelBox').classList.add('lost');
      $('result').textContent = `${names[reply]} beats ${names[choice]} — Aurelia wins!`;
      $('quip').textContent = `“${princessLines.loss[Math.floor(Math.random() * 3)]}”`;
      $('hint').textContent = 'The princess takes this round. Keep going!'; tone(300, .18);
    }
    updateScore();
    if (player === 3 || princess === 3) finish(player === 3);
  }
  function finish(victory) {
    locked = true;
    document.querySelectorAll('.choice').forEach(button => button.disabled = true);
    $('roundLabel').textContent = 'MATCH COMPLETE';
    $('scoreLabel').textContent = 'FINAL SCORE';
    $('result').textContent = victory ? 'The moonlit match is yours!' : 'A royal victory for Aurelia!';
    $('quip').textContent = victory ? '“You’ve earned the crown—and a rematch, anytime.”' : '“A lovely match! The rematch is yours to call.”';
    $('hint').textContent = 'Start a new game to play again.';
    if (victory) {
      best++; localStorage.setItem('moonlit-best', best); $('bestScore').textContent = best;
      tone(740, .2); setTimeout(() => tone(990, .28), 160);
    }
  }
  document.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => choose(button.dataset.choice)));
  $('resetBtn').addEventListener('click', () => {
    player = 0; princess = 0; round = 1; level = 0; locked = false;
    document.querySelectorAll('.choice').forEach(button => button.disabled = false);
    $('duelBox').classList.remove('won', 'lost', 'tie');
    $('playerHand').textContent = $('princessHand').textContent = '✦';
    $('result').textContent = 'Choose your hand to begin';
    $('quip').textContent = '“A royal challenge! Show me what you’ve got.”';
    $('hint').textContent = 'Rock beats scissors · Paper beats rock · Scissors beat paper';
    $('princess').className.baseVal = 'princess';
    $('wardrobeCount').textContent = '0 / 3'; $('progressFill').style.width = '0%'; $('outfitLabel').textContent = 'ROYAL BALL GOWN';
    $('scoreLabel').textContent = 'FIRST TO 3 WINS';
    updateScore();
  });
  const modal = $('modal');
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  $('rulesBtn').addEventListener('click', () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); $('closeModal').focus(); });
  $('closeModal').addEventListener('click', closeModal); $('modalOk').addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  $('soundBtn').addEventListener('click', () => {
    soundOn = !soundOn; $('soundBtn').textContent = soundOn ? '♫' : '♩';
    $('soundBtn').setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
    $('soundBtn').title = soundOn ? 'Sound on' : 'Sound off'; if (soundOn) tone(660);
  });
  document.addEventListener('keydown', event => {
    if (modal.classList.contains('open')) { if (event.key === 'Escape') closeModal(); return; }
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const shortcut = { '1': 'rock', '2': 'paper', '3': 'scissors' }[event.key];
    if (shortcut) { event.preventDefault(); choose(shortcut); }
  });
})();
