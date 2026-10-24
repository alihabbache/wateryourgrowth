(function () {
	'use strict';

	document.documentElement.classList.add('js');

	var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
	var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

	/* ---------- Header: scrolled state ---------- */
	var header = $('.site-header');
	function onScroll() {
		if (header) { header.classList.toggle('scrolled', window.scrollY > 24); }
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	/* ---------- Mobile nav ---------- */
	var toggle = $('.nav-toggle');
	var links = $('.nav-links');
	if (toggle && links) {
		toggle.addEventListener('click', function () {
			var open = links.classList.toggle('open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && links.classList.contains('open')) {
				links.classList.remove('open');
				toggle.setAttribute('aria-expanded', 'false');
				toggle.focus();
			}
		});
		document.addEventListener('click', function (e) {
			if (!links.contains(e.target) && !toggle.contains(e.target)) {
				links.classList.remove('open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	/* ---------- Reveal on scroll ---------- */
	var reveals = $$('.reveal');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('in');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
		reveals.forEach(function (el) { io.observe(el); });
	} else {
		reveals.forEach(function (el) { el.classList.add('in'); });
	}

	/* ---------- Audio player with waveform ---------- */
	function fmt(s) {
		if (!isFinite(s)) { return '0:00'; }
		var m = Math.floor(s / 60), sec = Math.floor(s % 60);
		return m + ':' + (sec < 10 ? '0' : '') + sec;
	}

	$$('.player').forEach(function (player) {
		var audio = $('audio', player);
		var btn = $('.player-btn', player);
		var wave = $('.wave', player);
		var cur = $('.t-cur', player);
		var dur = $('.t-dur', player);
		if (!audio || !btn || !wave) { return; }

		// Build a deterministic, natural-looking waveform
		var BARS = 48, bars = [];
		for (var i = 0; i < BARS; i++) {
			var h = 22 + Math.abs(Math.sin(i * 0.55) * 38) + Math.abs(Math.sin(i * 1.7 + 1) * 28);
			var b = document.createElement('i');
			b.style.setProperty('--h', Math.min(100, Math.round(h)) + '%');
			b.style.setProperty('--i', i);
			wave.appendChild(b);
			bars.push(b);
		}

		function setIcon() {
			btn.innerHTML = audio.paused ? '<i class="fa fa-play"></i>' : '<i class="fa fa-pause"></i>';
			btn.setAttribute('aria-label', audio.paused ? 'Play episode preview' : 'Pause episode preview');
			player.classList.toggle('playing', !audio.paused);
		}
		setIcon();

		btn.addEventListener('click', function () {
			if (audio.paused) {
				$$('.player audio').forEach(function (a) { if (a !== audio) { a.pause(); } });
				audio.play();
			} else {
				audio.pause();
			}
		});
		audio.addEventListener('play', setIcon);
		audio.addEventListener('pause', setIcon);
		audio.addEventListener('ended', function () { setIcon(); bars.forEach(function (x) { x.classList.remove('on'); }); });
		audio.addEventListener('loadedmetadata', function () { if (dur) { dur.textContent = fmt(audio.duration); } });
		audio.addEventListener('timeupdate', function () {
			if (cur) { cur.textContent = fmt(audio.currentTime); }
			var n = audio.duration ? Math.round((audio.currentTime / audio.duration) * BARS) : 0;
			bars.forEach(function (x, idx) { x.classList.toggle('on', idx < n); });
		});
		wave.addEventListener('click', function (e) {
			if (!audio.duration) { return; }
			var r = wave.getBoundingClientRect();
			audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
		});
	});

	/* ---------- Episode filter chips ---------- */
	var chips = $$('.chip[data-filter]');
	if (chips.length) {
		var cards = $$('.ep-card[data-cat]');
		chips.forEach(function (chip) {
			chip.addEventListener('click', function () {
				chips.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
				chip.classList.add('active');
				chip.setAttribute('aria-pressed', 'true');
				var f = chip.getAttribute('data-filter');
				cards.forEach(function (card) {
					var show = f === 'all' || card.getAttribute('data-cat') === f;
					card.classList.toggle('hide', !show);
				});
			});
		});
	}

	/* ---------- Contact form (opens the visitor's email app) ---------- */
	var form = $('#contact-form');
	var toast = $('.toast');
	if (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var name = form.elements.name.value.trim();
			var email = form.elements.email.value.trim();
			var msg = form.elements.message.value.trim();
			var subject = encodeURIComponent('Hello from ' + name);
			var body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
			window.location.href = 'mailto:WaterYourGrowthPodcast@gmail.com?subject=' + subject + '&body=' + body;
			if (toast) {
				toast.classList.add('show');
				setTimeout(function () { toast.classList.remove('show'); }, 3500);
			}
		});
	}

	/* ---------- Footer year ---------- */
	$$('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
