function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

$(function() {

	var updateCSVView = debounce(function(services) {
		var data = services["csv"].state || {};
		var esDesc = services["es"].state || {};
		$("#csvFilesPanelBody").empty();
		$("#csvFilesPanelBody").append(window.csvFiles({ list: data, desc: esDesc }));
		bindESSyncButtons();
	}, 50);

	var updateESView = debounce(function(services) {
		var data = services["es"].state || {};
		$("#esPanelBody").empty();
		$("#esPanelBody").append(window.es({ desc: data }));
		bindESSearchButtons();
	}, 50);

	var updateImagesView = debounce(function(services) {
		var data = services["images"].state || {};
		$("#imageProcessingPanelBody").empty();
		$("#imageProcessingPanelBody").append(window.images({ imageInfo:data, moment: moment }));
		bindImageProcessingButtons();
	}, 50);

	var updateTMSExportView = debounce(function(services) {
		var data = services["tmstocsv"].state || {};
		$("#tmsExportPanelBody").empty();
		$("#tmsExportPanelBody").append(window.tmsToCsv({ info: data, moment: moment }));
		bindTMSExportButtons();
	}, 50);

	var services = {
		csv: {
			route: './api/csv/list',
			state: null,
			updates: [updateCSVView],
			view: "#csvFilesPanelBody"
		},
		es: {
			route: './api/es/desc',
			state: null,
			updates: [updateCSVView, updateESView]
		},
		images: {
			route: './api/images/info',
			state: null,
			updates: [updateImagesView]
		},
		tmstocsv: {
			completes: [(function() { fetchServiceInfo("csv") })],
			route: './api/tmstocsv/info',
			state: null,
			updates: [updateTMSExportView]
		}
	}

	function handleProgressDataForName(name, status, data) {
		services[name].state = Object.assign(services[name].state || {}, data);
		services[name].updates.forEach(function (update) {
			update(services);
		});
		if (status === 'completed' && services[name].completes) {
			services[name].completes.forEach(function(complete) {
				complete(services);
			});
		}
	}

	function handleServiceStateForName(name, state) {
		services[name].state = state;
		services[name].updates.forEach(function (update) {
			update(services);
		});
	}

	function fetchServiceInfo(name) {
		var route = services[name].route;
		$.ajax(route).done(function(data) {
			handleServiceStateForName(name, data);
		}).fail(function (error) {
			console.log(error);
		});
	}

	function clearServiceView(name) {
		var viewName = viewNames[name];
		if (viewName !== undefined) {
			$("#" + viewName).empty();
			$("#" + viewName).append(window.empty());
			delete dataForName[name];
		}
	}

	function handleServiceAttached(name) {
		console.log("Service attached");
		if (services[name] !== undefined) {
			fetchServiceInfo(name);
		} else {
			console.warn("Received connection from unrecognized microservice name ", name);
		}
	}

	function handleWebsocketServiceUpdate(name, status, data) {
		if (services[name] !== undefined) {
			handleProgressDataForName(name, status, data);
		} else {
			console.warn("Received update from unrecognized microservice name ", name);
		}
	}

	function createUpdateSocket(port) {
		var socket = io(window.location.protocol + "//" + window.location.hostname + ":" + port);
		socket.on('status', handleWebsocketServiceUpdate);
		socket.on('announce', handleServiceAttached);
		socket.on('farewell', clearServiceView);
		socket.on('connect', function() {
			socket.emit('listNames');
		});
		return socket;
	}

	var socket = createUpdateSocket(window.location.port);
	function updateSearchResults(data) {
		$("#search_results").innerHTML = ''
		$("#search_results").append(renderjson(data));
	}

	function doSearchQuery() {
		var query = $("#query")[0].value;
		$.get('./api/es/search', { query: query }, updateSearchResults);
	}

	function bindESSearchButtons() {
		$("#query_button").click(doSearchQuery);

		$("#query").keypress(function(e, a) {
			if (e.which == 13) {
				doSearchQuery();
				return false;    //<---- Add this line
			}
		});

		$("#esValidateButton").click( function() {
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify({ csv:this.name }),
				dataType: 'json',
				type: 'POST',
				url: './validate'
			});
		});
	}

	function bindESSyncButtons() {
		$(".esSyncButton").click( function() {
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify({ csv:this.name }),
				dataType: 'json',
				type: 'POST',
				url: './sync'
			});
		});
	}

	function bindTMSExportButtons() {
		$("#tmsRun").click(function() {
			$.get('api/tmstocsv/run', function(response) {
				$("#test").text(response.time);
			});
			$("#tmsCancel").click(function() {
				$.get('api/tmstocsv/cancel');
			});
		});
	}

	function bindImageProcessingButtons() {
		$("#tile-images").click(function() {
			$.get('api/images/tile', function(response) { });
		});

		$("#upload-images").click(function() {
			console.log('upload images!');
			$.get('api/images/upload', function(response) { });
		});

		$("#upload-raw").click(function() {
			$.get('api/images/raw', function(response) { });
		});
	}
});
