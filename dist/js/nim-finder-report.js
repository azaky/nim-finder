$(function initializeParse() {
	var parseKeys = require('./parse-keys');
	Parse.initialize(parseKeys.getAppId(), parseKeys.getClientKey());
});

$(function initializeMaterial() {
	$.material.init();
});

$(function initializeResizableTextarea() {
	$.each($('textarea.auto-resize'), function() {
		var offset = this.offsetHeight - this.clientHeight;
		var resizeTextarea = function(el) {
			$(el).css('height', 'auto').css('height', el.scrollHeight + offset);
		};
		$(this).on('keyup input', function() { resizeTextarea(this); }).removeClass('auto-resize');
	});
});

$(function() {
	function showScreen(name) {
		$('.screen').hide();
		$('.screen[data-screen=' + name + ']').show();
	}

	var Report = Parse.Object.extend("Report");
	$('#submit').on('click', function() {
		var errorMessage = $('#error-message');
		var email = $('#email').val();
		var message = $('#message').val();

		errorMessage.hide();

		if (message.length) {
			var report = new Report();
			report.set("email", email);
			report.set("message", message);
			report.save(null, {
				success: function() {
					showScreen("success");
				},
				error: function(report, error) {
					errorMessage.show();
					errorMessage.text('Maaf, terjadi kesalahan: ' + error.message);
				}
			});
		}
	})
});
