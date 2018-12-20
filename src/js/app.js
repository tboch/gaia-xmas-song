var animation, snowdrift;
document.addEventListener('DOMContentLoaded', function () {
  // globally expose animation and snowdrift variables, as to make it readable by snowstorm
  animation = new StarsAnimation('animation-container');
  snowdrift = animation.snowdrift;

  var songParams = {
    data: jingleBells,
    mainVoice: {
      trackIdx: 1, synth: 'pulse'
    },
    otherVoices: [
      { trackIdx: 4, synth: 'square' }
    ]
  };

  animation.setSong(songParams);
});
