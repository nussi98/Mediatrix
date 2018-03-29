$(function() {
	//Variablen
	var socket,
		ini,
		sessId,
		presets,
		jwt = localStorage.getItem("jwt");
	var on = false,
		currentConf = {
			name: "",
			conf: {}
		},
		conf = {
			av: {},
			dmx: {},
			mixer: {},
			beamer: {}
		};

	//socket = new WebSocket('wss://10.0.0.121/wss');
	socket = new WebSocket("wss://10.0.0.144/wss");

	//wirft eine Exception
	socket.onerror = function(error) {
		console.log("WebSocket Error: " + error);
	};

	//wird beim erfolgreichen Öffnen des Sockets ausgegeben
	socket.onopen = function(event) {
		if (jwt != null) {
			socket.send('{"jwt":"' + jwt + '","ini":1}');
		}
		console.log("socket open: " + socket + " " + event);
	};

	//wird bei Response des Servers ausgegeben
	socket.onmessage = function(event) {
		if (JSON.parse(event.data)["ini"]) {
			console.log("das ist der ini-string: " + event.data);
			ini = (JSON && JSON.parse(event.data)) || $.parseJSON(event.data);
			presets = ini.ini.presets;
			liveStatus();
			getPresets();
		} else {
			console.log("message: " + event);
			$(".statusGrid").empty();
			liveStatus();
		}
	};

	//wird ausgegeben, wenn die Verbindung gekappt wurde
	socket.onclose = function(event) {
		console.log("socket closed: " + socket + " " + event);
	};

	//Daten versenden
	function send(data) {
		data.jwt = jwt;
		socket.send(JSON.stringify(data));
		console.log(JSON.stringify(data));
	}

	//mixer
	/*var request = $.ajax({
      url: 'http://10.10.2.1/socket.io/',
      success: function(data) {
        sessId = data.substring(0, 20);
      }
    }).done(function() {

    });

    mixerSocket = new WebSocket('ws://10.10.2.1/socket.io/1/websocket/' + sessId);
    //mixerSocket = new WebSocket('ws://10.10.2.1/socket.io/1/websocket/' + sessId);
    console.log(mixerSocket);

    mixerSocket.onerror = function(error) {
      console.log("WebSocket Error: " + error);
    };

    // Show a connected message when the WebSocket is opened
    mixerSocket.onopen = function(event) {
      console.log(mixerSocket + " opened");
    };

    // Handle messages sent by the server
    mixerSocket.onmessage = function(event) {
      var message = event.data;
      //console.log(message);
    };

    // Show a disconnected message when the WebSocket is closed
    mixerSocket.onclose = function(event) {
      console.log(mixerSocket+" closed "+ event.data);
    };

    function sendVolumeToMixer(message){
      if(message.channel == "m"){
        var command = "3:::SETD^"+message.channel+".mix^"+message.volume;
      }else{
        var command = "3:::SETD^i."+message.channel+".mix^"+message.volume;
      }
      console.log(command);
      mixerSocket.send(command);
    }

    function muteButton(){
      if ($(this).attr("data-type") == "mixer") {
        if ($(this).attr("data-state") == "0") {
          $(this).attr("data-state", "1");
          var command = "3:::SETD^i."+ $(this).attr("data-id") +".mute^"+1;
          conf.mixer.mute = 1;
          console.log(command);
        } else {
          $(this).attr("data-state", "0");
          var command = "3:::SETD^i."+ $(this).attr("data-id") +".mute^"+0;
          conf.mixer.mute = 0;
          console.log(command);
        }
      }
      mixerSocket.send(command);
    }

    function keepAlive() {
      mixerSocket.send("3:::ALIVE");
      console.log("Alive");
    }


    setTimeout(function() {
      setInterval(function() {
        keepAlive()
      }, 15000)
    }, 3000);*/

	/*    "mixer": {
          "0": 1,
          "1": 0.8
        }
      }

      for(var x = 0;x<Object.keys(testJson.mixer);x++){
        console.log("id: "+testJson.mixer[x]);
      }*/

	//Werte der Slider auslesen
	function Slider(slider) {
		switch (slider.target.getAttribute("data-type")) {
			case "av":
				console.log(
					"Dieser Slider ist von einem AV-Receiver: " +
						slider.target.getAttribute("data-type")
				);
				var data = {
					av: {
						volume: slider.get() / 100,
						channel: slider.target.getAttribute("data-id")
					}
				};
				conf.av = {
					volume: slider.get() / 100,
					channel: slider.target.getAttribute("data-id")
				};
				send(data);
				return data;
				break;
			case "mixer":
				console.log(
					"Dieser Slider ist von einem Mixer: " + slider.get()
				);
				var data = {
					mixer: {
						volume: slider.get() / 100,
						channel: slider.target.getAttribute("data-id")
					}
				};
				conf.mixer = {
					volume: slider.get() / 100,
					channel: slider.target.getAttribute("data-id")
				};
				//sendVolumeToMixer(conf.mixer);
				send(data);
				return data;
				break;
			case "hue":
				console.log(
					"Dieser Slider ist von einem DMX Gerät: " +
						"Id: " +
						slider.target.getAttribute("data-id") +
						" " +
						slider.get()
				);
				var data = {
					dmx: {
						scheinwerfer: {
							id: slider.target.getAttribute("data-id"),
							hue: slider.get()
						}
					}
				};
				conf.dmx = {
					scheinwerfer: {
						id: slider.target.getAttribute("data-id"),
						hue: slider.get()
					}
				};
				send(data);
				return data;
				break;
			case "rgbw":
				console.log(
					"Dieser Slider ist von einem DMX Gerät: " +
						"Id: " +
						slider.target.getAttribute("data-id") +
						" " +
						slider.get()
				);
				var data = {
					dmx: {
						scheinwerfer: {
							id: slider.target.getAttribute("data-id"),
							[slider.target.getAttribute(
								"data-col"
							)]: slider.get()
						}
					}
				};
				conf.dmx = {
					scheinwerfer: {
						id: slider.target.getAttribute("data-id"),
						[slider.target.getAttribute("data-col")]: slider.get()
					}
				};
				send(data);
				return data;
				break;
		}
	}

	function muteButton() {
		var $this = $(this);
		if ($this.attr("data-type") == "mixer") {
			if ($this.attr("data-state") == "0") {
				$this.attr("data-state", "1");
				var data = {
					id: $this.attr("data-id"),
					mute: 1
				};
				$.snackbar({
					content: "Das Mikrofon wurde stumm geschalten"
				});
				conf.mixer.mute = 1;
			} else {
				$this.attr("data-state", "0");
				//var command = "3:::SETD^i."+ $(this).attr("data-id") +".mute^"+0;
				var data = {
					id: $this.attr("data-id"),
					mute: 0
				};
				conf.mixer.mute = 0;
			}
		}
		send(data);
	}

	$(".mute").on("click", muteButton);

	//Werte der Beamer Steuerung auslesen
	function Beamer() {
		var data = {
			beamer: {}
		};
		//Kontrollieren ob vom Typ Beamer
		if ($(this).attr("data-type") == "beamer") {
			//Power Knopf erkennen
			if ($(this).attr("data-value") == "power") {
				if (!on) {
					on = true;
					data.beamer.on = 1;
					conf.beamer.on = 1;
					console.log("ein " + data.beamer.on);
					send(data);
				} else {
					on = false;
					data.beamer.off = 0;
					conf.beamer.off = 0;
					console.log("aus " + data.beamer.off);
					send(data);
				}
			} else {
				console.log("Beamer - Value: " + $(this).attr("data-value"));
				if ($(this).attr("data-value") == "src") {
					data.beamer.source = 1;
					conf.beamer.source = 1;
				} else if ($(this).attr("data-value") == "freeze") {
					data.beamer.freeze = 1;
					conf.beamer.freeze = 1;
				} else if ($(this).attr("data-value") == "blackout") {
					data.beamer.blackout = 1;
					conf.beamer.blackout = 1;
				}
				send(data);
			}
		}
	}

	//Werte der Modes des AV-Receivers auslesen
	function Buttons() {
		var data = {
			av: {
				mode: ""
			}
		};
		if ($(this).attr("data-type") == "av") {
			console.log(
				"Data-type=" +
					$(this).attr("data-type") +
					" Value: " +
					$(this).html()
			);
			data.av.mode = $(this).html();
			console.log(data);
		}
	}

	function selectAvConf() {
		console.log("selectAvConf");
		$(".flex-container").append($("#avTemplate").html());
		for (let i = 0; i < Object.keys(ini.ini.av.presets).length; i++) {
			$("<li/>", {
				text: "" + ini.ini.av.presets[i],
				class: "mode",
				"data-type": "av",
				appendTo: "#avModes"
			});
		}
		var slider = document.querySelector("#avSlider1");
		noUiSlider.create(slider, {
			start: 0,
			format: wNumb({
				decimals: 0
			}),
			connect: [false, false],
			direction: "rtl",
			orientation: "vertical",
			range: {
				min: parseInt(ini.ini.av.minVolume),
				max: parseInt(ini.ini.av.maxVolume)
			}
		});
		slider.noUiSlider.on("slide", function(values, handle) {
			Slider(this);
			document.getElementById("avSlider1Value").innerHTML =
				values[handle];
		});
		updateSliders();
		return true;
	}

	function selectLichtConf() {
		console.log("selectLichtConf");
		for (let i = 0; i < Object.keys(ini.ini.dmx).length; i++) {
			var scheinwerfer = ini.ini.dmx["scheinwerfer" + i];
			if (scheinwerfer.numberChannels == "4") {
				var t = document.querySelector("#rgbwTemplate").innerHTML;
				for (
					let j = 0;
					j < parseInt(scheinwerfer.numberChannels);
					j++
				) {
					t = t.replace(/{:id}/, scheinwerfer.id);
				}
				$(".flex-container").append(t);
			} else if (scheinwerfer.numberChannels == "1") {
				var t = document.querySelector("#hueTemplate").innerHTML;
				for (
					let j = 0;
					j < parseInt(scheinwerfer.numberChannels);
					j++
				) {
					t = t.replace(/{:id}/, scheinwerfer.id);
				}
				$(".flex-container").append(t);
			}
		}
		return true;
	}

	function selectMixerConf() {
		console.log("selectMixerConf");
	}

	function setPreset() {
		console.log("Preset '" + $("#presetName").val() + "' speichern");
		var name = $("#presetName").val();
		currentConf["name"] = name;
		currentConf["conf"] = conf;
		/*var request = $.ajax({
            url: '',
            success: function(data) {
                sessId = data.substring(0, 20);
            }
            }).done(function() {

        });*/
		$.snackbar({
			content:
				"Das Preset " +
				$("#presetName").val() +
				" wurde erfolgreich erstellt"
		});
		send(conf);
	}

	$("#savePreset").on("click", setPreset);

	function getPresets() {
		for (let i = 0; i <= Object.keys(presets).length; i++) {
			console.log(presets[i].name + " conf:");
			console.log(presets[i].conf);
			/*for(let j=0;i<Object.keys(presets[i].conf).length;j++){
              console.log(j);
            }*/

			var div = $("<div/>", {
				class: "preset"
			}).attr("data-preset", i);
			div.append("<h2>" + presets[i].name + "</h2>");
			if (presets[i].conf.dmx) {
				div.append(
					"<div> <i class='fas fa-lightbulb'> </i> <h3>" +
						Object.keys(presets[i].conf.dmx).length +
						"</h3> </div>"
				);
			} else if (presets[i].av) {
				div.append(
					"<div> <i class='fas fa-volume-up'> </i> <h3>" +
						presets[i].conf.av.mode +
						"</h3> </div>"
				);
			} else if (presets[i].beamer) {
				div.append(
					"<div> <i class='fas fa-video'> </i> <h3>" +
						presets[i].conf.beamer +
						"</h3> </div>"
				);
			} else if (presets[i].mixer) {
				div.append(
					"<div> <i class='fas fa-microphone'> </i> <h3>" +
						presets[i].conf.mixer +
						"</h3> </div>"
				);
			}
			$(".presentation").append(div);
		}
		$(".preset").on("click", selectPreset);
	}

	function selectPreset() {
		console.log(typeof $(this).attr("data-preset"));
		console.log(presets);
		send(presets[parseInt($(this).attr("data-preset"))]);
	}

	function liveStatus() {
		buildStatus("Master", ini.live.av.volume, "dB");
		buildStatus("Helligkeit", ini.live.dmx[0], "");
	}

	function updateSliders() {
		setSlider("avSlider1", ini.live.av.volume);
		document.getElementById("avSlider1Value").innerHTML =
			ini.live.av.volume;
	}

	function buildStatus(key, value, unit) {
		var div = $("<div>");
		div.append("<span>" + key + "</span><span>" + value + unit + "</span>");
		$(".statusGrid").append(div);
	}

	function chmod() {
		console.log($(this).is(":checked"));
	}

	$(".tgl").on("click", chmod);

	var isMobile =
		"ontouchstart" in document.documentElement &&
		navigator.userAgent.match(/Mobi/);

	//EventListener den Box Buttons hinzufügen
	$(".boxButtons").on("click", function() {
		toggleFlexContainer(1);
		togglePresMode(2);
		toggleStatus(1);

		if (isMobile) {
			toggleMobileOptions(1);
		}

		switch ($(this).attr("data-boxbtn")) {
			case "1":
				if ($("#beamerBox").parents(".flex-container").length == 1) {
					$("#beamerBox").remove();
				} else {
					$(".flex-container").append($("#beamerTemplate").html());
					$(".menu-item").each(function() {
						$(this).on("click", Beamer);
					});
					$(".menu-open-button").on("click", Beamer);
				}
				break;
			case "2":
				if ($("#avBox").parents(".flex-container").length == 1) {
					$("#avBox").remove();
				} else {
					if (selectAvConf()) {
						$(".mode").each(function() {
							this.addEventListener("click", Buttons);
						});
					}
				}
				break;
			case "3":
				if ($("#mikrofonBox").parents(".flex-container").length == 1) {
					$("#mikrofonBox").remove();
				} else {
					selectMixerConf();
					$(".flex-container").append($("#mikroTemplate").html());
					initSlider("#mikrofonBox");
					//$(".mute").on("click", muteButton);
				}
				break;
			case "4":
				if ($(".lichtBox").parents(".flex-container").length == 1) {
					$(".lichtBox").remove();
				} else {
					if (selectLichtConf()) {
						console.log("SelectLichtConf ist fertig");
						initSlider(".lichtBox");
					}
				}
				break;
			case "5":
				console.log("Präsentationsmodus einblenden");
				//hide all boxes
				$(".flex-container").empty();
				toggleFlexContainer(0);
				togglePresMode(0);
				toggleStatus(0);
				if (isMobile) {
					toggleMobileOptions(0);
				}
				break;
		}
	});

	function togglePresMode(count) {
		switch (count) {
			case 0:
				if ($(".presentation").hasClass("flex")) {
					$(".presentation").removeClass("flex");
				} else {
					$(".presentation").addClass("flex");
					//getPresets(".presentation");
				}
				break;
			case 1:
				$(".presentation").addClass("flex");
				getPresets(".presentation");
				break;
			case 2:
				$(".presentation").removeClass("flex");
				break;
		}
	}

	function toggleFlexContainer(count) {
		switch (count) {
			case 0:
				if ($(".flex-container").hasClass("flex")) {
					$(".flex-container").removeClass("flex");
				} else {
					$(".flex-container").addClass("flex");
				}
				break;

			case 1:
				$(".flex-container").addClass("flex");
		}
	}

	function toggleStatus(count) {
		switch (count) {
			case 0:
				if ($(".statusBox").hasClass("toggleStatus")) {
					$(".statusBox").removeClass("toggleStatus");
				} else {
					$(".statusBox").addClass("toggleStatus");
				}
				break;

			case 1:
				$(".statusBox").addClass("toggleStatus");
		}
	}

	function toggleMobileOptions(count) {
		switch (count) {
			case 0:
				if ($(".mobileOptions").hasClass("toggleMobileOptions")) {
					$(".mobileOptions").removeClass("toggleMobileOptions");
				} else {
					$(".mobileOptions").addClass("toggleMobileOptions");
				}
				break;

			case 1:
				$(".mobileOptions").addClass("toggleMobileOptions");
		}
	}

	function setSlider(id, val) {
		var slider = document.getElementById(id);
		slider.noUiSlider.set(val);
	}

	//Slider initialisieren, je nach dem, welche gerade im Markup eingeblendet sind
	function initSlider(container) {
		var sliders = $(container).find(".slider");
		var valueFields = $(container).find(".valueField");

		sliders.each(function(slider) {
			noUiSlider.create(this, {
				start: 0,
				format: wNumb({
					decimals: 0
				}),
				connect: [false, false],
				direction: "rtl",
				orientation: "vertical",
				range: {
					min: 0,
					max: 100
				}
			});
		});

		sliders.each(function(i, slider) {
			this.noUiSlider.on("slide", function(values, handle) {
				Slider(this);
				valueFields.get(i).innerHTML = values[handle];
			});
		});
	}
});
