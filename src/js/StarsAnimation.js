// StarsAnimation
// 
// Manages the animation of Gaia dancing stars
//

var StarsAnimation = function (divId) {
    this.init(divId);
};

StarsAnimation.synths = {
    pulse: new Tone.Synth({
        oscillator: {
            type: "pulse"
        },
        envelope: {
            release: 0.07
        }
    }).toMaster(),
    square: new Tone.Synth({
        oscillator: {
            type: "square"
        },
        envelope: {
            release: 0.07
        }
    }).toMaster(),
    triangle: new Tone.Synth({
        oscillator: {
            type: "triangle"
        },
        envelope: {
            release: 0.07
        }
    }).toMaster(),
    drums: new Tone.MembraneSynth().toMaster(),
    poly: new Tone.PolySynth(10, Tone.Synth, {

        "oscillator": {
            "type": "fatsawtooth",
            "count": 3,
            "spread": 0
        },
        "envelope": {
            "attack": 0.2,
            "decay": 0.2,
            "sustain": 0.5,
            "release": 0.4,
            "attackCurve": "linear"
        },
    }).toMaster()
};


// some utility functions
var shapesCache = {};
// return the shape corresponding to the parameters:
//    diam: diameter in pixels
//    color: color of the shape
//    singing: is the star currently singing
//    rotationDirection: 1 or -1
var getShape = function (diam, color, singing, rotationDirection) {
    var key = diam + '-' + color + '-' + singing + '-' + rotationDirection;


    if (shapesCache[key] === undefined) {
        var c = document.createElement('canvas');
        var ctx = c.getContext('2d');

        var startY = 0;
        if (singing) {
            c.width = diam + 4 + 12;
            startY = 2 * diam;
            c.height = diam * 3;

            ctx.translate(diam / 2., startY + diam / 2.);
            ctx.rotate(rotationDirection * (Math.PI * 10) / 180);
            ctx.translate(- diam / 2., - (startY + diam / 2.));

        }
        else {
            c.width = c.height = diam;
        }
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(diam / 2., startY + diam / 2., diam / 2., 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(diam / 2., startY + diam / 2., diam / 2. - 1, 0, 2 * Math.PI, true);
        ctx.fill();
        if (singing) {
            // add eyes
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(diam / 2 - 4, startY + diam / 2 - 2, 3, 0, 2 * Math.PI, true);
            ctx.arc(diam / 2 + 4, startY + diam / 2 - 2, 3, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.arc(diam / 2 - 3, startY + diam / 2 - 2.5, 1.5, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.arc(diam / 2 + 5, startY + diam / 2 - 2.5, 1.5, 0, 2 * Math.PI, true);
            ctx.fill();
            // add mouth
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(diam / 2 + 2, startY + diam / 2 + 4, 2, 0, 2 * Math.PI, true);
            ctx.fill();

            // add note bar
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.moveTo(diam / 2 + 4, diam * 2 + 2);
            ctx.lineTo(diam / 2 + 4, 0);
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.lineTo(diam / 2 + 11, 7);
            ctx.lineTo(diam + 3, 16);
            ctx.lineTo(diam, 20);
            ctx.stroke();
        }

        shapesCache[key] = c;
    }

    return shapesCache[key];
};

var drawFunction = function (source, canvasCtx, viewParams) {
    var diam;
    if (source.isSinging) {
        diam = 18;
        if (source.isSingingToRight) {
            canvasCtx.drawImage(source.myShapeSingingRight, source.x - diam / 2., source.y - 2 * diam - diam / 2.);
        }
        else {
            canvasCtx.drawImage(source.myShapeSingingLeft, source.x - diam / 2., source.y - 2 * diam - diam / 2.);

        }
    }
    else {
        diam = 8;
        canvasCtx.drawImage(source.myShape, source.x - diam / 2., source.y - diam / 2.);
    }

};

function onKonamiCode(cb) {
    var input = '';
    var key = '38384040373937396665';
    document.addEventListener('keydown', function (e) {
        input += ("" + e.keyCode);
        if (input === key) {
            return cb();
        }
        if (!key.indexOf(input)) return;
        input = ("" + e.keyCode);
    });
}

// Class prototype
StarsAnimation.prototype = {
    init: function (divId) {
        var parentDiv = document.getElementById(divId);
        var parentDimension = parentDiv.offsetWidth;
        parentDiv.style.height = parentDiv.offsetWidth + 'px';

        this.scene = {
            width: parentDimension,
            height: parentDimension,
            cx: parentDimension / 2.,
            cy: parentDimension / 2.,
            radius: 0.5 * 0.875 * parentDimension
        };

        this.snowdrift = new Snowdrift(this.scene, this.scene.width);
        this.initAladinLite();

        var self = this;
        this.nbCodes = 0;
        onKonamiCode(function () {
            console.log('secret unlocked');
            self.nbCodes++;
            for (var k = 0; k < self.stars.sources.length; k++) {
                self.stars.sources[k].isSinging = false;
            }
            self.starsSinging = [];
            self.stars.reportChange();
            if (self.nbCodes % 2 == 0) {
                self.setSong({
                    data: littleFugue,
                    mainVoice: {
                        trackIdx: 1, synth: 'square'
                    },
                    otherVoices: [
                        { trackIdx: 4, synth: 'triangle' },
                        { trackIdx: 3, synth: 'triangle' },
                        { trackIdx: 2, synth: 'triangle' }
                    ]
                });
            }
            else {
                self.setSong({
                    data: radioGaga,
                    mainVoice: {
                        trackIdx: 14, synth: 'poly'
                    },
                    otherVoices: [
                        { trackIdx: 1, synth: 'drums' },
                        { trackIdx: 2, synth: 'pulse' },
                        { trackIdx: 3, synth: 'poly' },
                        { trackIdx: 8, synth: 'square' },
                        { trackIdx: 10, synth: 'pulse' }
                    ]
                });
            }
            self.assignNotesToStars();
        });
    },

    initAladinLite: function () {
        this.aladin = A.aladin('#aladin-lite-div', { pixelateCanvas: false, fov: 105, cooFrame: 'galactic', target: 'Sgr A*', showReticle: false, showZoomControl: false, showFullscreenControl: false, showLayersControl: false, showGotoControl: false, showFrame: false, survey: 'P/Mellinger/color' });
        this.aladin.setImageSurvey(this.aladin.createImageSurvey('CDS/P/DM/flux-color-Rp-G-Bp/I/345/gaia2', 'CDS/P/DM/flux-color-Rp-G-Bp/I/345/gaia2',
            'https://gea.esac.esa.int/archive/visualization/plugin-files/aladin:RGBHiPS/', 'galactic', 4, { imgFormat: 'png' }));

        this.aladin.setFovRange(10, 140);

        var minMag, maxMag;
        this.note2Sources = {};
        var self = this;
        function successCallback(sources) {
            self.aladin.addCatalog(self.stars);
            self.assignNotesToStars();
        };
        this.stars = A.catalogFromURL('data/gaia-dr2-brightest-stars-good-plx-quality.vot', { shape: drawFunction, onClick: 'showPopup' }, successCallback, false);
        document.getElementById('aladin-lite-div').appendChild(this.snowdrift.canvas);

        snowStorm.targetElement = 'aladin-lite-div';
        snowStorm.zIndex = 1000;
        snowStorm.flakesMax = 20;
        snowStorm.followMouse = false;
        snowStorm.randomizeWind();
        snowStorm.usePositionFixed = false;
        snowStorm.usePixelPosition = true;

        this.controlBtn = document.getElementById('control');
        this.controlState = 'notstarted';
        var self = this;
        this.controlBtn.addEventListener('click', function () {

            if (self.controlState == 'notstarted') {
                // this line is needed because of Chrome new sound policy on mobile devices
                Tone.context.resume();
                
                // start the transport to hear the events
                Tone.Transport.start("+0.3");
                snowStorm.start();
                snowStorm.resume();

                self.controlState = 'playing';
                this.classList.remove('play');
                this.classList.add('pause');
            }
            else if (self.controlState == 'playing') {
                Tone.Transport.pause();
                snowStorm.freeze();

                self.controlState = 'paused';
                this.classList.remove('pause');
                this.classList.add('play');
            }
            else if (self.controlState == 'paused') {
                // start the transport to hear the events
                Tone.Transport.start();
                snowStorm.resume();

                self.controlState = 'playing';
                this.classList.remove('play');
                this.classList.add('pause');
            }
        });



        var self = this;
        // add key shortcuts for animation
        parent.addEventListener('keypress', function (e) {
            // 114 = 'r' --> animate to the right
            if (e.keyCode == 114) {
                var raDec = self.aladin.getRaDec();
                var lonLat = CooConversion.J2000ToGalactic([raDec[0], raDec[1]]);
                var newLon = (lonLat[0] + 90) % 360;
                var newRaDec = CooConversion.GalacticToJ2000([newLon, lonLat[1]]);
                self.aladin.animateToRaDec(newRaDec[0], newRaDec[1], 10);
            }
            // 108 = 'l' --> animate to the left
            else if (e.keyCode == 108) {
                var raDec = self.aladin.getRaDec();
                var lonLat = CooConversion.J2000ToGalactic([raDec[0], raDec[1]]);
                var newLon = (lonLat[0] - 90 + 360) % 360;
                var newRaDec = CooConversion.GalacticToJ2000([newLon, lonLat[1]]);
                self.aladin.animateToRaDec(newRaDec[0], newRaDec[1], 10);
            }
            // 90 = 'Z' --> zoom in
            else if (e.keyCode == 90) {
                self.aladin.zoomToFoV(60, 6);
            }
            // 122 = 'z' --> zoom in
            else if (e.keyCode == 122) {
                self.aladin.zoomToFoV(180, 8);
            }
        });
    },

    assignNotesToStars: function () {
        var sources = this.stars.sources;
        var minMag = 999;
        var maxMag = -999;

        // sort in decreasing order
        sources.sort(function (a, b) {
            return b.data.phot_g_mean_mag - a.data.phot_g_mean_mag;
        });
        minMag = sources[sources.length - 1].data.phot_g_mean_mag;
        maxMag = sources[0].data.phot_g_mean_mag;

        var nbPerBin = sources.length / this.scaleMainVoice.length;
        // correspondance between notes and stars
        for (var idxInScale = 0; idxInScale < this.scaleMainVoice.length; idxInScale++) {
            var curNote = this.scaleMainVoice[idxInScale];
            if (idxInScale == this.scaleMainVoice.length - 1) {
                this.note2Sources[curNote] = sources.slice(idxInScale * nbPerBin);
            }
            else {
                this.note2Sources[curNote] = sources.slice(idxInScale * nbPerBin, (idxInScale + 1) * nbPerBin);
            }
            // create symbols for each star
            for (var k = 0; k < this.note2Sources[curNote].length; k++) {
                var source = this.note2Sources[curNote][k];
                source.isSingingToRight = k % 2 == 0;

                var diam = 8;
                var mag = source.data.phot_g_mean_mag;
                var normalizedMagForCurrentCategory = (idxInScale + 1) / this.scaleMainVoice.length; // between 0 and 1
                var color = interpolateLinearly(normalizedMagForCurrentCategory, magma);
                var r = Math.round(255 * color[0]);
                var g = Math.round(255 * color[1]);
                var b = Math.round(255 * color[2]);
                source.myShape = getShape(diam, 'rgb(' + r + ',' + g + ',' + b + ')', false);

                diam = 18;
                source.myShapeSingingRight = getShape(diam, 'rgb(' + r + ',' + g + ',' + b + ')', true, 1);
                source.myShapeSingingLeft = getShape(diam, 'rgb(' + r + ',' + g + ',' + b + ')', true, -1);
            }
        }
    },

    initSnowstorm: function () {

        snowStorm.targetElement = 'aladin-lite-div';
        snowStorm.zIndex = 1000;
        snowStorm.flakesMax = 20;
        snowStorm.followMouse = false;
        snowStorm.randomizeWind();
        snowStorm.usePositionFixed = false;
        snowStorm.usePixelPosition = true;
    },

    setSong: function (songParams) {
        this.songParams = songParams;
        this.initSong();
    },

    initSong: function () {
        Tone.Transport.cancel(); // cancel all existing events

        var track = this.songParams.data;
        // make sure you set the tempo before you schedule the events
        Tone.Transport.bpm.value = track.header.bpm;

        var delay = 0.1; // to help scheduling

        var mainVoiceTrackIdx = this.songParams.mainVoice.trackIdx;
        var scale = [];
        for (var k = 0; k < track.tracks[mainVoiceTrackIdx].notes.length; k++) {
            var note = track.tracks[mainVoiceTrackIdx].notes[k].name;
            if (scale.indexOf(note) < 0) {
                scale.push(note);
            }
        }
        scale.sort(function (a, b) {
            return Tone.Frequency(a) - Tone.Frequency(b);
        })
        this.scaleMainVoice = scale;

        this.starsSinging = []; // list of stars currently singing
        var mainVoiceNoteIdx = 0; // index of note of main track currently being played
        var self = this;
        new Tone.Part(function (time, note) {
            //use the events to play the synth
            // notes are triggered a bit later than the current time as to allow better scheduling (cf. https://github.com/Tonejs/Tone.js/wiki/Performance)
            var synth = StarsAnimation.synths[self.songParams.mainVoice.synth];
            synth.triggerAttackRelease(note.name, note.duration, time + delay, note.velocity);

            setTimeout(function () {
                for (var k = 0; k < self.starsSinging.length; k++) {
                    self.starsSinging[k].isSinging = false;
                }
                self.starsSinging = self.note2Sources[note.name];
                for (var k = 0; k < self.starsSinging.length; k++) {
                    self.starsSinging[k].isSinging = true;
                    self.starsSinging[k].isSingingToRight = !self.starsSinging[k].isSingingToRight;
                }
                self.stars.reportChange();
            }, 1000 * delay);

            mainVoiceNoteIdx++;
            if (mainVoiceNoteIdx == track.tracks[mainVoiceTrackIdx].notes.length) {
                mainVoiceNoteIdx = 0;
                snowStorm.stop();
                snowStorm.freeze();
                setTimeout(function () {
                    Tone.Transport.stop();
                    self.controlBtn.classList.remove('pause');
                    self.controlBtn.classList.add('play');
                    for (var k = 0; k < self.starsSinging.length; k++) {
                        self.starsSinging[k].isSinging = false;
                    }
                    self.stars.reportChange();
                }, 500);
                self.controlState = 'notstarted';
            }
        }, track.tracks[mainVoiceTrackIdx].notes).start(+0.1);

        if (this.songParams.hasOwnProperty('otherVoices')) {
            for (var k = 0; k < this.songParams['otherVoices'].length; k++) {
                var curVoice = this.songParams['otherVoices'][k];
                new Tone.Part(function (time, note) {
                    //use the events to play the synth
                    // notes are triggered a bit later than the current as to allow better scheduling (cf. https://github.com/Tonejs/Tone.js/wiki/Performance)
                    var synth = StarsAnimation.synths[curVoice.synth];
                    synth.triggerAttackRelease(note.name, note.duration, time + delay, note.velocity);
                }, track.tracks[curVoice.trackIdx].notes).start(+0.1);
            }

        }

    }

};
