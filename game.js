(() => {
  const $ = (id) => document.getElementById(id);
  const gameOver = $('gameOver');
  const hands = { rock: '✊', paper: '✋', scissors: '✌' };
  const names = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  const princessLines = {
    win: ['A clever move! You have my attention.', 'Nicely played. The night is young!', 'You caught me off guard—well done!'],
    loss: ['A royal victory! Shall we go again?', 'My move! You nearly had me.', 'A point for the crown. Your turn!'],
    tie: ['Great minds think alike. Again!', 'A tie! Fate wants another round.', 'We matched—let’s try once more.']
  };
  let player = 0, princess = 0, round = 1, level = 0, gear = 5, locked = false, soundOn = false;
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
  function updateGear() {
    $('gearLabel').textContent = `${gear} / 5`;
    $('gearPips').setAttribute('aria-valuenow', gear);
    $('gearPips').querySelectorAll('i').forEach((pip, index) => pip.classList.toggle('spent', index >= gear));
  }
  function updateWardrobe() {
    const outfits = [
      'ROYAL BALL GOWN',
      'NO TIARA',
      'SLEEVELESS BALL GOWN',
      'BALL GOWN WITHOUT CAPE',
      'SATIN COURT DRESS',
      'OPAQUE SATIN UNDERDRESS'
    ];
    const descriptions = [
      'Princess Aurelia in her royal gown layered over an opaque satin underdress.',
      'Princess Aurelia without her tiara, wearing her layered royal gown.',
      'Princess Aurelia in a sleeveless royal gown layered over an opaque satin underdress.',
      'Princess Aurelia in her royal gown without its cape, layered over an opaque satin underdress.',
      'Princess Aurelia in an opaque satin court dress.',
      'Princess Aurelia in her opaque satin underdress, which remains fully covering.'
    ];
    $('princess').setAttribute('class', `princess level-${level}`);
    $('princess').setAttribute('aria-label', descriptions[level]);
    $('wardrobeCount').textContent = `${level} / 5`;
    $('progress').setAttribute('aria-valuenow', level);
    $('progressFill').style.width = `${level * 20}%`;
    $('outfitLabel').textContent = outfits[level];
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
      player++; level = Math.min(5, level + 1);
      $('duelBox').classList.add('won');
      $('result').textContent = `${names[choice]} beats ${names[reply]} — you win!`;
      $('quip').textContent = `“${princessLines.win[Math.floor(Math.random() * 3)]}”`;
      $('hint').textContent = [
        'A point for you. Aurelia’s royal layers are still in place.',
        'Her tiara is set aside; the opaque satin underdress remains on.',
        'Her outer sleeves are removed; the satin gown remains.',
        'Her cape is removed; the satin gown remains.',
        'The overskirt is removed; her satin court dress remains.',
        'Her final outer layer is gone; Aurelia remains fully covered by her opaque satin underdress.'
      ][level];
      updateWardrobe();
      tone(660, .15); setTimeout(() => tone(880, .18), 90);
    } else {
      princess++; gear--; updateGear(); $('duelBox').classList.add('lost');
      $('result').textContent = `${names[reply]} beats ${names[choice]} — Aurelia wins!`;
      $('quip').textContent = `“${princessLines.loss[Math.floor(Math.random() * 3)]}”`;
      $('hint').textContent = gear > 0 ? `Your knight loses a gear point. ${gear} remain.` : 'Your knight is out of gear!'; tone(300, .18);
    }
    updateScore();
    if (player === 5) finish(true);
    else if (gear === 0) finish(false);
  }
  function finish(victory) {
    locked = true;
    document.querySelectorAll('.choice').forEach(button => button.disabled = true);
    $('roundLabel').textContent = victory ? 'MATCH COMPLETE' : 'GAME OVER';
    $('scoreLabel').textContent = 'FINAL SCORE';
    $('result').textContent = victory ? 'The moonlit match is yours!' : 'Your knight is out of gear.';
    $('quip').textContent = victory ? '“You’ve earned the crown—and a rematch, anytime.”' : '“Aurelia takes the match. Rally your knight and try again.”';
    $('hint').textContent = victory ? 'Start a new game to play again.' : 'The princess stands victorious over your fallen shield.';
    gameOver.classList.toggle('victory', victory);
    $('gameOverKicker').textContent = victory ? 'THE CROWN IS YOURS' : 'THE CROWN HOLDS';
    $('gameOverTitle').textContent = victory ? 'Victory!' : 'Game Over';
    $('gameOverCopy').textContent = victory
      ? 'Aurelia applauds your five-point win. The knight claims the throne in full armor, and her opaque satin underdress remains on.'
      : 'Aurelia claims the match. Your fully armored knight has fallen, and the princess stands victorious over his shield.';
    $('gameOverReset').textContent = victory ? 'Play again' : 'Challenge again';
    gameOver.classList.add('open'); gameOver.setAttribute('aria-hidden', 'false'); $('gameOverReset').focus();
    if (victory) {
      best++; localStorage.setItem('moonlit-best', best); $('bestScore').textContent = best;
      tone(740, .2); setTimeout(() => tone(990, .28), 160);
    } else {
      tone(220, .3);
    }
  }
  document.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => choose(button.dataset.choice)));
  $('resetBtn').addEventListener('click', () => {
    player = 0; princess = 0; round = 1; level = 0; gear = 5; locked = false;
    document.querySelectorAll('.choice').forEach(button => button.disabled = false);
    gameOver.classList.remove('open', 'victory'); gameOver.setAttribute('aria-hidden', 'true'); updateGear();
    $('duelBox').classList.remove('won', 'lost', 'tie');
    $('playerHand').textContent = $('princessHand').textContent = '✦';
    $('result').textContent = 'Choose your hand to begin';
    $('quip').textContent = '“A royal challenge! Show me what you’ve got.”';
    $('hint').textContent = 'Rock beats scissors · Paper beats rock · Scissors beat paper';
    updateWardrobe();
    $('gameOverKicker').textContent = 'THE CROWN HOLDS';
    $('gameOverTitle').textContent = 'Game Over';
    $('gameOverCopy').textContent = 'Aurelia claims the match. Your fully armored knight has fallen, and the princess stands victorious over his shield.';
    $('gameOverReset').textContent = 'Challenge again';
    $('scoreLabel').textContent = 'FIRST TO 5 WINS';
    updateScore();
  });
  $('gameOverReset').addEventListener('click', () => $('resetBtn').click());
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
