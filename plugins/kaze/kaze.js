var kaze = {};

kaze.fadeSpeed = 150;
kaze.$navigation = $('#navigation');
kaze.$container = $('#container');
kaze.$content = $('#content');
kaze.$loadingAnimation = $('#loading-animation')
kaze.originalURL = window.location.pathname;
kaze.currentURL = kaze.originalURL;
kaze.lastRequest = null;

kaze.ajaxifyLinks = function() {
	$('.ajax').each(function() {
		$(this).removeClass('ajax');
	}).click(function(e) {
		var url = this.getAttribute('href');

		e.preventDefault();
		e.stopPropagation();

		if(url === window.location.pathname)
			return;

		//if(kaze.$navigation && kaze.$navigation.offset().top < 0)
		//	kaze.scrollToElement(kaze.$navigation);

		kaze.loadURL(url, true);
	});
};

kaze.fadeContent = function($content, response) {
	kaze.$loadingAnimation.stop().fadeIn(kaze.fadeSpeed);

	$content.promise().done(function() {
		kaze.$loadingAnimation.stop().fadeOut(kaze.fadeSpeed);

		$content.html(response).fadeIn(kaze.fadeSpeed, function() {
			kaze.ajaxifyLinks();

			// DOM content loaded event
			var DOMContentLoadedEvent = document.createEvent('Event');
			DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true);
			window.document.dispatchEvent(DOMContentLoadedEvent);
		});
	});
};

kaze.scrollToElement = function(element, time) {
	time = (time !== undefined) ? time : kaze.fadeSpeed * 2;

	kaze.$container.animate({
		scrollTop: kaze.$container.scrollTop() + element.offset().top
	}, time);
};

kaze.loadURL = function(url, addToHistory) {
	if(kaze.lastRequest) {
		kaze.lastRequest.abort();
		kaze.lastRequest = null;
	}

	kaze.currentURL = url;

	if(addToHistory) {
		history.pushState(url, null, url);
	}

	kaze.$content.stop().fadeOut(kaze.fadeSpeed);

	kaze.lastRequest = $.get('/_' + url, function(response) {
		kaze.lastRequest = null;
		kaze.fadeContent(kaze.$content, response);
	});

	kaze.markActiveLinks(url);
};

kaze.markActiveLinks = function(url) {
	if(url === undefined)
		url = window.location.pathname;

	$('a').each(function() {
		var $this = $(this);
		var href = $this.attr('href');

		if(href === url) {
			$this.addClass('active');
		} else {
			$this.removeClass('active');
		}
	});
};

// Run
kaze.ajaxifyLinks();
kaze.markActiveLinks();

// Load history (used on backward and forward button)
window.addEventListener('popstate', function(e) {
	var url = e.state;

	if(url) {
		kaze.loadURL(url, false);
	} else if(kaze.currentURL !== kaze.originalURL) {
		kaze.loadURL(kaze.originalURL, false);
	}
});