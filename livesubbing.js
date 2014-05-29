(function(){
	function LiveSubbing(){
		if(!gapi){
			throw "gapi not loaded!";
		}
		
		// WARNING: be aware that YOUR-API-KEY inside html is viewable by all your users.
		// Restrict your key to designated domains or use a proxy to hide your key
		// to avoid misuage by other party.
		this.api_key = "YOUR-API-KEY";
		
		this.DEBUGGING = false;
		this.maxHeight = $(window).height();
		this.maxWidth = $(window).width();
		this.globalShow = false;
		this.globalShowCustom = false;
		this.globalShowSaved = false;
		this.overlays = {};
		this.currentTimestamp = new Date();
		this.canvas = null;
		this.canvas_screen = null;
		this.canvas_subtitles = null;
		this.name = "";
		this.fullcanvas = "";
		this.customcanvas = "";
		this.loadedoverlay = "";
		this.modalOverlay;
		this.modalIsOpen = false;

		this.recognition;
		this.recognizing = false;
		this.ignore_onend;
		this.start_timestamp;
		this.final_transcript = '';
		this.interim_transcript_temp = '';
		this.langSpokenChoosen = false;
		this.langDialectChoosen = false;
		this.langReadChoosen = false;
		this.translationCounterID = 0;


		this.languages_spoken = [['Afrikaans',['af-ZA']],['Bahasa Indonesia',['id-ID']],['Bahasa Melayu',['ms-MY']],['Català',['ca-ES']],['Čeština',['cs-CZ']],['Deutsch',['de-DE']],['English',['en-AU','Australia'],['en-CA','Canada'],['en-IN','India'],['en-NZ','New Zealand'],['en-ZA','South Africa'],['en-GB','United Kingdom'],['en-US','United States']],['Español',['es-AR','Argentina'],['es-BO','Bolivia'],['es-CL','Chile'],['es-CO','Colombia'],['es-CR','Costa Rica'],['es-EC','Ecuador'],['es-SV','El Salvador'],['es-ES','España'],['es-US','Estados Unidos'],['es-GT','Guatemala'],['es-HN','Honduras'],['es-MX','México'],['es-NI','Nicaragua'],['es-PA','Panamá'],['es-PY','Paraguay'],['es-PE','Perú'],['es-PR','Puerto Rico'],['es-DO','República Dominicana'],['es-UY','Uruguay'],['es-VE','Venezuela']],['Euskara',['eu-ES']],['Français',['fr-FR']],['Galego',['gl-ES']],['Hrvatski',['hr_HR']],['IsiZulu',['zu-ZA']],['Íslenska',['is-IS']],['Italiano',['it-IT','Italia'],['it-CH','Svizzera']],['Magyar',['hu-HU']],['Nederlands',['nl-NL']],['Norsk bokmål',['nb-NO']],['Polski',['pl-PL']],['Português',['pt-BR', 'Brasil'],['pt-PT','Portugal']],['Română',['ro-RO']],['Slovenčina',['sk-SK']],['Suomi',['fi-FI']],['Svenska',['sv-SE']],['Türkçe',['tr-TR']],['български',['bg-BG']],['Pусский',['ru-RU']],['Српски',['sr-RS']],['한국어',['ko-KR']],['中文',['cmn-Hans-CN','普通话 (中国大陆)'],['cmn-Hans-HK','普通话 (香港)'],['cmn-Hant-TW','中文 (台灣)'],['yue-Hant-HK','粵語 (香港)']],['日本語',['ja-JP']],['Lingua latīna',['la']]];
		this.language_spoken_default = "English";
		this.language_spoken_dialect_default = "United States";

		this.languages_read = [['Afrikaans',['af']],['Albanian',['sq']],['Arabic',['ar']],['Azerbaijani',['az']],['Basque',['eu']],['Bengali',['bn']],['Belarusian',['be']],['Bulgarian',['bg']],['Catalan',['ca']],['Chinese Simplified',  ['zh-CN']],['Chinese Traditional', ['zh-TW']],['Croatian',['hr']],['Czech',['cs']],['Danish',['da']],['Dutch',['nl']],['English',['en']],['Esperanto',['eo']],['Estonian',['et']],['Filipino',['tl']],['Finnish',['fi']],['French',['fr']],['Galician',['gl']],['Georgian',['ka']],['German',['de']],['Greek',['el']],['Gujarati',['gu']],['Haitian Creole',['ht']],['Hebrew',['iw']],['Hindi',['hi']],['Hungarian',['hu']],['Icelandic',['is']],['Indonesian',['id']],['Irish',['ga']],['Italian',['it']],['Japanese',['ja']],['Kannada',['kn']],['Korean',['ko']],['Latin',['la']],['Latvian',['lv']],['Lithuanian',['lt']],['Macedonian',['mk']],['Malay',['ms']],['Maltese',['mt']],['Norwegian',['no']],['Persian',['fa']],['Polish',['pl']],['Portuguese',['pt']],['Romanian',['ro']],['Russian',['ru']],['Serbian',['sr']],['Slovak',['sk']],['Slovenian',['sl']],['Spanish',['es']],['Swahili',['sw']],['Swedish',['sv']],['Tamil',['ta']],['Telugu',['te']],['Thai',['th']],['Turkish',['tr']],['Ukrainian',['uk']],['Urdu',['ur']],['Vietnamese',['vi']],['Welsh',['cy']],['Yiddish',['yi']]];
		this.language_read_default = "English";

		if(typeof FileReader !== "undefined"){
			this.fileReader = new FileReader();
		}
		
		gapi.hangout.onApiReady.add(this.onApiReady.bind(this));
		jQuery(window).resize(this.onWindowResize.bind(this));
	}
	
	LiveSubbing.prototype.onWindowResize = function(evt){
		this.log("Window resized");
		this.maxHeight = $(window).height();
		this.maxWidth = $(window).width();
		this.scale();
	}

	LiveSubbing.prototype.buildDOM = function(){
		this.log("Building DOM");
		var div = this.createElement("div");
		var label = this.createElement("label");
		var pgraph = this.createElement("p");
		var span = this.createElement("span");
		var option = this.createElement("option");
		var table = this.createElement("table");
		var inputText = this.createElement("input", {"class": "input", "type": "text"});
		var inputCheckbox = this.createElement("input", {"class": "input", "type": "checkbox", "disabled": "disabled"});
		var cleardiv = this.createElement("div", {"class": "clear"});


		// Settings Panel
		var settingsPanelCover = div.clone().attr({"id": "settingsCover"});
		var settingsPanelCoverBackground = div.clone().attr({"class": "coverBackground"});
		var settingsPanelCoverText = pgraph.clone().attr({"class": "coverText"}).html("To change settings, please turn off VML Babel (top right corner)");
		settingsPanelCover.append(settingsPanelCoverBackground, settingsPanelCoverText);


		var header = this.createElement("div", {"id": "header"});
		header.append(this.createElement("span", {"class": "header_icon"}));
		header.append(this.createElement("span", {"class": "header_title"}).html("Settings"));

		var shadow = div.clone().attr({"class":"shadow"}).css({"opacity": "1"});
		var shadow_bottom = div.clone().attr({"class":"shadow_bottom"}).css({"opacity": "1"});
		var body = div.clone().attr({"id": "body"}).css({"height": (this.maxHeight-132)+"px"});
		var form = this.createElement("form", {"id": "form"});
		var fieldset_livesubbing	= this.createElement("fieldset", {"class": "fieldset"});
		var legend_livesubbing	= this.createElement("legend", {"class": "legend"}).text("Settings").appendTo(fieldset_livesubbing);
		var button_save			= this.createElement("a", {"id": "button_save", "class": "button_save"}).html("Save");
		var inputText_name 		= inputText.clone().attr({"id": "Name", "class": "box_text", "name": "name", "placeholder": "Your Name"});
		var inputText_tagline 	= inputText.clone().attr({"id": "Tag", "class": "box_text", "name": "tagline", "placeholder": "ex. Title, Location", "value":""}).css({"font-color":"#c0c0c0"});		
		var spanSelect_title		= this.createElement("span", {"class": "header_title"}).html("Text Overlay Color");
		var inputSelect 			= this.createElement("select", {"id": "Select", "class": "box_select"});
		var spanSelect_spokenTitle	= this.createElement("span", {"class": "header_title"}).html("Language You Will Be Speaking");
		var inputSelect_spoken		= this.createElement("select", {"id": "SelectSpoken", "class": "box_select required"});
		var inputSelect_dialect		= this.createElement("select", {"id": "SelectDialect", "class": "box_select required", "disabled": "disabled", "style": "visibility:hidden"});
		var spanSelect_readTitle	= this.createElement("span", {"class": "header_title"}).html("Language You Want To Read");
		var inputSelect_read		= this.createElement("select", {"id": "SelectRead", "class": "box_select required"});

		// populate language selects
		var totalSpoken = this.languages_spoken.length;
		inputSelect_spoken.append(option.clone().attr({"value": -1}).text("Select Language"));
		for (var ls = 0; ls < totalSpoken; ls++) {
			if (this.languages_spoken[ls][0] == this.language_spoken_default){
				inputSelect_spoken.append(option.clone().attr({"value": ls, "selected": true}).text(this.languages_spoken[ls][0]));
			} else {
				inputSelect_spoken.append(option.clone().attr({"value": ls}).text(this.languages_spoken[ls][0]));	
			}
			
		}
		var totalRead = this.languages_read.length;
		inputSelect_read.append(option.clone().attr({"value": -1}).text("Select Language"));
		for (var lr = 0; lr < totalRead; lr++) {
			if (this.languages_read[lr][0][1] == this.language_read_default){
				inputSelect_read.append(option.clone().attr({"value": lr, "selected": true}).text(this.languages_read[lr][0]));
			} else {
				inputSelect_read.append(option.clone().attr({"value": lr}).text(this.languages_read[lr][0]));
			}
		}

		var optionWhite 		= option.clone().attr({"value": "white"}).text("White");
		var optionYellow 		= option.clone().attr({"value": "yellow"}).text("Yellow");
		var spacer 				= div.clone().css({"margin-left":"25px", "margin-top":"10px"});
		var hr_line				= this.createElement("hr", {"class":"line"});

		inputSelect.append(optionWhite, optionYellow);

		fieldset_livesubbing.append(inputText_name,inputText_tagline,spanSelect_title,inputSelect,spanSelect_spokenTitle,inputSelect_spoken,inputSelect_dialect,spanSelect_readTitle,inputSelect_read,button_save);
		form.append(fieldset_livesubbing, spacer);
		body.append(shadow, form);
		
		this.canvas = this.createElement("canvas", {"id":"canvas"}).height("75").width("640")[0];
		this.canvas_custom = this.createElement("canvas", {"id":"canvas_custom"}).height("360").width("640")[0];
		this.canvas_subtitles = this.createElement("canvas", {"id":"canvas_subtitles"}).height("360").width("640")[0];

		jQuery("#container_settings").append(settingsPanelCover, header, body, shadow_bottom);

		// Log Panel
		var header_log = this.createElement("div", {"id": "header_log"});
		header_log.append(this.createElement("span", {"class": "header_icon"}));
		header_log.append(this.createElement("span", {"class": "header_title"}).html("VML Babel App"));
		var switch_mic	= this.createElement("a",{"id": "switch_mic", "class": "onoffswitch micswitch disabledSwitch"});
		header_log.append(switch_mic);


		var body_log = div.clone().attr({"id": "body_log"}).css({"height": (this.maxHeight-112)+"px", "width": (this.maxWidth-304)+"px"});
		var shadow_log = div.clone().attr({"class":"shadow"}).css({"opacity": "1"});
		var shadow_log_bottom = div.clone().attr({"class":"shadow_bottom"}).css({"opacity": "1"});

		var speechcapture = div.clone().attr({"class":"speechcapture container"});
		var spanwrapper = div.clone().attr({"class":"speechwrapper"});
		
		var finalSpan = this.createElement("span", {"id": "final_span", "class": "final"})
		var interimSpan = this.createElement("span", {"id": "interim_span", "class": "interim"})
		var legend_speechcapture	= this.createElement("legend", {"class": "container-legend"}).text("Speech Capture");
		speechcapture.append(legend_speechcapture, spanwrapper);
		spanwrapper.append(finalSpan,interimSpan);

		var speechlog = div.clone().attr({"class":"speechlog container"});
		var speechlogClearButton = div.clone().attr({"id":"clearLog-button"}).html("Clear Log");
		var legend_speechlog	= this.createElement("legend", {"class": "container-legend", "style":"margin-top:-20px"}).text("Speech Log");
		var logwrapper = div.clone().attr({"id": "log-wrapper", "class":"logwrapper"});
		var transcripttable = table.clone().attr({"id": "transcript-table", "class":"transcripttable"});
		speechlog.append(speechlogClearButton, legend_speechlog, logwrapper);
		logwrapper.append(transcripttable);

		body_log.append(shadow_log, speechcapture, speechlog);

		jQuery("#container_log").append(header_log, body_log, shadow_log_bottom);

		// Binds
		button_save.click(this.saveSettings.bind(this));
		speechlogClearButton.click(this.clearLog.bind(this));
		switch_mic.click(this.toggleMic.bind(this));
		inputText_tagline.click(this.clearTagline.bind(this));
		inputText_tagline.focus(this.clearTagline.bind(this));

		this.changeLanguageSpoken();
		this.changeLanguageRead();

		inputSelect_spoken.change(this.changeLanguageSpoken.bind(this));
		inputSelect_dialect.change(this.changeLanguageDialect.bind(this));
		inputSelect_read.change(this.changeLanguageRead.bind(this));		

		body.on("scroll", this.bodyOnScroll.bind(this));
	}

	LiveSubbing.prototype.setupWebSpeech = function(){
		var self = this;
		if (!('webkitSpeechRecognition' in window)) {
			this.webkitSpeechUpgrade();
		} else {
			this.recognition = new webkitSpeechRecognition();
		    this.recognition.continuous = true;
		    this.recognition.interimResults = true;
		}

		this.recognition.onaudioend = function() {
	    };

	    this.recognition.onaudiostart = function() {
	    };

		this.recognition.onend = function() {
			self.recognizing = false;
			if (self.ignore_onend) {
				return;
			}
		
			self.toggleMicButtonState("off");
			if (!self.final_transcript) {
				return;
			}
			
			if (window.getSelection) {
				window.getSelection().removeAllRanges();
				var range = document.createRange();
				range.selectNode(jQuery("#final_span"));
				window.getSelection().addRange(range);
			}
		} 

		this.recognition.onerror = function(event) {
			if (event.error == 'no-speech') {
				self.toggleMicButtonState("off");
				self.showInfo('no_speech');
				self.ignore_onend = true;
			}
			if (event.error == 'audio-capture') {
				self.toggleMicButtonState("off");
				self.showInfo('no_microphone');
				self.ignore_onend = true;
			}
			if (event.error == 'not-allowed') {
				if (event.timeStamp - self.start_timestamp < 100) {
					self.showInfo('blocked');
				} else {
					self.showInfo('denied');
				}
				self.ignore_onend = true;
			}
		}

		this.recognition.onnomatch = function() {
		}

		this.recognition.onresult = function(event) {
			var interim_transcript = '';
			if (typeof(event.results) == 'undefined') {
				self.recognition.onend = null;
				self.recognition.stop();
				self.webkitSpeechUpgrade();
				return;
			}
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					self.final_transcript += event.results[i][0].transcript;
				} else {
					interim_transcript += event.results[i][0].transcript;
				}
			}

			self.final_transcript = self.capitalize(self.final_transcript);
			$("#final_span").html(self.linebreak(self.final_transcript));
			$("#interim_span").html(self.linebreak(interim_transcript));
			
			if (self.final_transcript || interim_transcript) {
				var sourceText = escape(self.final_transcript);
				if (interim_transcript != ""){
					self.interim_transcript_temp = interim_transcript;
				} else {
					self.changeState(self.interim_transcript_temp);
				}
			}
		};

		this.recognition.onsoundedd = function() {
		};

		this.recognition.onsoundstart = function() {
		};

		this.recognition.onspeechend = function() {
		};

		this.recognition.onspeechstart = function() {
		};

		this.recognition.onstart = function() {
			self.recognizing = true;
			self.showInfo('speak_now');
			self.toggleMicButtonState("on");
		}; 		
	}

	LiveSubbing.prototype.changeState = function (pText) {
		var inputSelect_spoken = jQuery("#SelectSpoken");
		var list = this.languages_spoken[inputSelect_spoken.val()];
		var langSpoken_Code = list[1][0].split("-")[0];		
		var local_participant = gapi.hangout.getLocalParticipant();

		gapi.hangout.data.submitDelta({
			participant_id:""+gapi.hangout.getLocalParticipantId(),
			participant_name: local_participant.person.displayName+"",
			remote_language_spoken:''+langSpoken_Code, 
			text:''+pText
		});
		
		this.displayStraightLocalText(this.interim_transcript_temp, local_participant.person.displayName);
		this.interim_transcript_temp = "";
	}

	LiveSubbing.prototype.displayStraightLocalText = function(pText, pUser) {
    	var inputSelect_spoken = jQuery("#SelectSpoken");
		var list = this.languages_spoken[inputSelect_spoken.val()];
		var langSpoken_Code = list[1][0].split("-")[0];

    	$("#transcript-table").prepend('<tr>'+
    			'<td><span class="transcriptuser">'+pUser+'</span></td>'+
    			'<td><span class="transcriptlanguage">'+langSpoken_Code+'</span></td>'+
    			'<td style="width:100%"><span class="transcriptmessage">'+pText+'</span></td>'+
    		'</tr>');
    	// successfully added to log, now clear speach capture box
    	this.final_transcript = "";
    	$("#final_span").html("");
		$("#interim_span").html("");

		var canvasContext = this.getCanvasSubtitles().getContext("2d");
		this.prepareCanvasContext(canvasContext,75,640);
		var overlayColor;
		switch(this.getInputValue("Select option:selected")){
			case "white":
				overlayColor = "white";
				break;
			case "yellow":
				overlayColor = "yellow";
				break;
			default:
				overlayColor = "white";	
				break;
		}
		this.drawTextToCanvasSubtitles(pText, 0, 0, 28, overlayColor);
		
		var canvasImage = this.createImageResourceFromCanvas(this.getCanvasSubtitles());
		
		var local_participantId = gapi.hangout.getLocalParticipantId(); //gapi.hangout.getLocalParticipant();
		this.setSubtitleAvatar(local_participantId, canvasImage);
  	}

	LiveSubbing.prototype.getImageURL = function(){
	}

  	LiveSubbing.prototype.clearSubtitleAvatar = function(participantId) {
  		gapi.hangout.av.clearAvatar(participantId);
  	}

  	LiveSubbing.prototype.setSubtitleAvatar = function(participantId, imageUrl) {
  		gapi.hangout.av.setAvatar(participantId, imageUrl);
  	}

	LiveSubbing.prototype.displayStraightText = function (pUser, pRemoteLanguage, pText) {
		$("#transcript-table").prepend('<tr>'+
    			'<td><span class="transcriptuser">'+pUser+'</span></td>'+
    			'<td><span class="transcriptlanguage">'+pRemoteLanguage+'</span></td>'+
    			'<td style="width:100%"><span class="transcriptmessage">'+pText+'</span></td>'+
    		'</tr>');
	}

	LiveSubbing.prototype.displayTranslateText = function (pUser, pRemoteLanguage, pText, pTranslatedText){
		$("#transcript-table").prepend('<tr>'+
    			'<td><span class="transcriptuser">'+pUser+'</span></td>'+
    			'<td><span class="transcriptlanguage">'+pRemoteLanguage+'</span></td>'+
    			'<td style="width:100%"><span class="transcriptmessage">'+pTranslatedText+'</span><br/><span class="transcriptmessage">('+pText+')</span></td>'+
    		'</tr>');
	}	

	LiveSubbing.prototype.capitalize = function(s) {
  		var first_char = /\S/;
    	return s.replace(first_char, function(m) { return m.toUpperCase(); });
  	}

	LiveSubbing.prototype.linebreak = function(s) {
		var two_line = /\n\n/g;
  		var one_line = /\n/g;
    	return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  	}

	LiveSubbing.prototype.getCanvas = function(){
		return this.canvas;
	}

	LiveSubbing.prototype.getCanvasSubtitles = function(){
		return this.canvas_subtitles;
	}

	LiveSubbing.prototype.changeLanguageSpoken = function(){
		var inputSelect_spoken = jQuery("#SelectSpoken");
		var inputSelect_dialect = jQuery("#SelectDialect");

		if (inputSelect_spoken.val() > -1){
			inputSelect_spoken.removeClass("required");
			this.langSpokenChoosen = true;
		} else {
			this.langSpokenChoosen = false;
			if (!inputSelect_spoken.hasClass("required")){
				inputSelect_spoken.addClass("required");
			}
		}

		var list = this.languages_spoken[inputSelect_spoken.val()];
	    inputSelect_dialect.find('option').remove().end();
	    if (list[1].length > 1){
	    	inputSelect_dialect.append(this.createElement("option").attr({"value": -1}).text("Select Language"));
	    	this.langDialectChoosen = false;
	    	for (var z = 1; z < list.length; z++) {
	      		//inputSelect_dialect.append(this.createElement("option").attr({"value": list[z][0]}).text(list[z][1]));
	      		if (list[z][1] == this.language_spoken_dialect_default) {
	      			inputSelect_dialect.append(this.createElement("option").attr({"value": z, "selected":true}).text(list[z][1]));
	      			this.langDialectChoosen = true;
	      		} else {
	      			inputSelect_dialect.append(this.createElement("option").attr({"value": z}).text(list[z][1]));
	      		}
	    	}
	    	inputSelect_dialect.removeAttr("disabled").css({'visibility':'visible', 'display':''});
	    } else {
	    	this.langDialectChoosen = true;
	    	inputSelect_dialect.attr('disabled', 'disabled').css({'visibility':'hidden','display':'none'});
	    }
	}

	LiveSubbing.prototype.changeLanguageRead = function() {
		var inputSelect_read = jQuery("#SelectRead");
		if (inputSelect_read.val() > -1){
			inputSelect_read.removeClass("required");
			this.langReadChoosen = true;
		} else {
			this.langReadChoosen = false;
			if (!inputSelect_read.hasClass("required")){
				inputSelect_read.addClass("required");
			}
		}
	}

	LiveSubbing.prototype.changeLanguageDialect = function(){
		var inputSelect_dialect = jQuery("#SelectDialect");
		if (inputSelect_dialect.val() > -1){
			inputSelect_dialect.removeClass("required");
			this.langDialectChoosen = true;
		} else {
			this.langDialectChoosen = false;
			if (!inputSelect_dialect.hasClass("required")){
				inputSelect_dialect.addClass("required");
			}
		}
	}

	LiveSubbing.prototype.clearTagline = function(){
		jQuery("#inputText_tagline").value = '';
	}

	LiveSubbing.prototype.toggleMicButtonState = function(toggleTo){
		var mic = jQuery("#switch_mic");
  		if (toggleTo == "on"){
  			mic.removeClass("onoffswitch").addClass("onoffswitch_active").removeClass("disabledSwitch");
  		} else {
			mic.removeClass("onoffswitch_active").addClass("onoffswitch");
  		}
  	}

	LiveSubbing.prototype.toggleMic = function(event) {
		var mic = jQuery("#switch_mic");
		if (mic.hasClass("disabledSwitch") == false){
			this.toggleShow();	
		} else {
			this.toggleMicButtonState("off");
		}
	}

	LiveSubbing.prototype.clearLog = function () {
		$("#transcript-table").html("");
	}

	LiveSubbing.prototype.saveSettings = function (){
		var btn = jQuery("#button_save");
		if (btn.hasClass("button_disabled") == false){
			var mic = jQuery("#switch_mic");
			if (this.langSpokenChoosen == true && this.langDialectChoosen == true && this.langReadChoosen == true){
				mic.removeClass("disabledSwitch");
			} else {
				mic.addClass("disabledSwitch");
				return;
			}
		} 
	}

	LiveSubbing.prototype.toggleShow = function(){
		var settingsCover = jQuery("#settingsCover");

		if(this.overlays[this.loadedoverlay]){
			this.overlays[this.loadedoverlay].setVisible(false);
			this.overlays[this.loadedoverlay].dispose();
			delete this.overlays[this.loadedoverlay];
			this.globalShowSaved = false;
		}
		
		if(this.globalShow === false){
			if (this.recognizing) {
				this.recognition.stop();
			}

			this.final_transcript = '';
			var inputSelect_spoken = jQuery("#SelectSpoken");
			var inputSelect_dialect = jQuery("#SelectDialect");
			if (inputSelect_spoken.val() > -1){
				// spoken selected
				if (jQuery("#SelectDialect option").length > 0){
					// spoken selected and dialect selected
					if (inputSelect_dialect.val() > -1){
						this.recognition.lang = this.languages_spoken[inputSelect_spoken.val()][inputSelect_dialect.val()][0];
					} else {
						this.recognition.lang = this.languages_spoken[inputSelect_spoken.val()][1][0];
					}
				} else {
					// spoken selected and dialect not selected
					this.recognition.lang = this.languages_spoken[inputSelect_spoken.val()][1];
				}
			} else {
				// spoken not selected and dialect not selected
			}			
			
			if (this.recognition.lang){
				this.recognition.start();
				this.ignore_onend = false;
				$("#final_span").html("");
				$("#interim_span").html("");
				this.start_timestamp = event.timeStamp;
			}
			jQuery("#button_save").addClass("button_disabled");
			jQuery("#Name").attr({"disabled": "disabled"});
			jQuery("#Tag").attr({"disabled": "disabled"});
			jQuery("#Select").attr({"disabled": "disabled"});
			jQuery("#SelectSpoken").attr({"disabled": "disabled"});
			jQuery("#SelectRead").attr({"disabled": "disabled"});
			jQuery("#SelectDialect").attr({"disabled": "disabled"});
			settingsCover.css("display", "initial");
			this.globalShow = true;
			this.createCanvas();
			return;
		}

		jQuery("#button_save").removeClass("button_disabled");
		jQuery("#Name").removeAttr("disabled");
		jQuery("#Tag").removeAttr("disabled");
		jQuery("#Select").removeAttr("disabled");
		jQuery("#SelectSpoken").removeAttr("disabled");
		jQuery("#SelectRead").removeAttr("disabled");
		jQuery("#SelectDialect").removeAttr("disabled");
		settingsCover.css("display", "none");
		
		this.toggleMicButtonState("off");
		if (this.recognizing) {
			this.recognition.stop();
		}
		this.final_transcript = '';
		$("#final_span").html("");
		$("#interim_span").html("");

		this.globalShow = false;

		this.overlays['livesubbing'].setVisible(false);
		this.overlays['livesubbing'].dispose();
		delete this.overlays['livesubbing'];
	}

	LiveSubbing.prototype.createImageResourceFromCanvas = function(canvas){
		return gapi.hangout.av.effects.createImageResource(canvas.toDataURL("image/png"));
	}

	LiveSubbing.prototype.prepareCanvasContext = function(canvas,h,w){
		canvas.canvas.width = w;
		canvas.canvas.height = h;
		canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
		canvas.textAlign = "left";
		canvas.textBaseline = "top";
	}

	LiveSubbing.prototype.createCanvas = function(){
		var canvasContext = this.getCanvas().getContext("2d");
		
		this.prepareCanvasContext(canvasContext,75,640);
		
		var overlayColor;
		switch(this.getInputValue("Select option:selected")){
			case "white":
				overlayColor = "white";
				break;
			case "yellow":
				overlayColor = "yellow";
				break;
			default:
				overlayColor = "white";	
				break;
		}

		var finish = function(){
			if(gapi.hangout.onair.isOnAirHangout() === true) {
				this.drawTextToCanvas(this.getInputValue("Name"), 130, 10, 28, "white");
				this.drawTextToCanvas(this.getInputValue("Tag"), 180, 47, 15, overlayColor);
			}else{
				this.drawTextToCanvas(this.getInputValue("Name"), 60, 10, 28, "white");
				this.drawTextToCanvas(this.getInputValue("Tag"), 60, 47, 15, overlayColor);
			}

			var canvasImage = this.createImageResourceFromCanvas(canvasContext.canvas);
			this.overlays['livesubbing'] = canvasImage.createOverlay({
			});

			this.overlays['livesubbing'].setScale(1, gapi.hangout.av.effects.ScaleReference.WIDTH);
			this.overlays['livesubbing'].setPosition(0, 0.39);
			var overlayCanvas = canvasContext.canvas;
			this.fullcanvas = overlayCanvas.toDataURL();
			var overlayData = overlayCanvas.toDataURL();
			if(this.globalShow === true){
				this.overlays['livesubbing'].setVisible(true);
			}else{
				this.overlays['livesubbing'].setVisible(false);
				this.overlays['livesubbing'].dispose();
				delete this.overlays['livesubbing'];
			}
		}.bind(this)

		finish();
	}

	LiveSubbing.prototype.drawImageToCanvas = function(context, data, x, y, w, h, callback, prepcall){
		var img = new Image();

		img.onload = function(){
			(prepcall || function(){}).call(this, img, w, h);
			context.drawImage(img, x, y, img.width, img.height);
			callback.call(this);
		}.bind(this)
		img.src = data;
	}

	LiveSubbing.prototype.drawTextToCanvas = function(text, x, y, size, color, font){
		var canvasContext = this.getCanvas().getContext("2d");
		canvasContext.font = size + "px " + (font ? font : "Arial");
		canvasContext.fillStyle = color || "black";
		canvasContext.fillText(text, x, y);
	}

	LiveSubbing.prototype.drawTextToCanvasSubtitles = function(text, x, y, size, color, font){
		var canvasContext = this.getCanvasSubtitles().getContext("2d");
		canvasContext.font = size + "px " + (font ? font : "Arial");
		canvasContext.fillStyle = color || "black";
		canvasContext.fillText(text, x, y);
	}	

	LiveSubbing.prototype.scaleSize = function(maxHeight, width, height){
		var ratio = maxHeight / height;
		width = width * ratio;
		height = maxHeight;
		return[width, height];
	}

	LiveSubbing.prototype.scale = function(){
		jQuery("#body").height(this.maxHeight-84);
		jQuery("#body_log").height(this.maxHeight-84);
		//jQuery("#body_log").width(this.maxWidth-304);
		jQuery("#body_log").width(this.maxWidth-324);
	}

	LiveSubbing.prototype.bodyOnScroll = function(evt){
		jQuery("#body").scrollTop() > 0 ? jQuery(".shadow", "#container_settings").show() : jQuery(".shadow", "#container_settings").hide(); 
	}
	
	LiveSubbing.prototype.getInputValue = function(id){
		return jQuery("#" + id).val();
	}

	LiveSubbing.prototype.getParticipant = function(){
		var uid = gapi.hangout.getLocalParticipantId();
		var p = gapi.hangout.getParticipants();
		for(i = 0; i < p.length; i++) {
			if(p[i].id == uid){
				jQuery("#Name").attr({"value":p[i].person.displayName});
			}
		}
	}
	
	LiveSubbing.prototype.createElement = function(type, attr){
		return jQuery("<" + type + ">").attr(attr || {});
	}

	LiveSubbing.prototype.log = function(){
		if(this.DEBUGGING === true){
			//console.log(Array.prototype.slice.call(arguments))
		}
	}

	LiveSubbing.prototype.webkitSpeechUpgrade = function(){
		this.showInfo('upgrade');
	}

	LiveSubbing.prototype.showInfo = function(key){
		var type = ''
		var message = '';

		if (key.length > -1){
			switch (key){
				case 'start':
					type = 'Information';
					message = 'Before you can begin, select your language preferences on the left. Once finished, toggle VML Babel App to the "on" state click the toggle button located in the top right corner. If you wish to change your language settings in the future toggle off the VML Babel App, change your settings and then turn it back on.';
					break;
				case 'speak_now':
					type = 'Success';
					message = 'You have successfully setup the VML Babel App, please close this window and being speaking.';
					break;
				case 'no_speech':
					type = 'Alert';
					message = 'Click the "Allow" to enable your microphone.';
					break;
				case 'no_microphone':
					type = 'Alert';
					message = 'No speech was detected. You may need to adjust your <a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">microphone settings</a>.';			
					break;
				case 'allow':
					type = 'Alert';
					message = 'No microphone was found. Ensure that a microphone is installed and that <a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">microphone settings</a> are configured correctly.';			
					break;
				case 'denied':
					type = 'Error';
					message = 'Permission to use microphone was denied.';			
					break;
				case 'blocked':
					type = 'Error';
					message = 'Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream';			
					break;
				case 'upgrade':
					type = 'Error';
					message = 'Web Speech API is not supported by this browser. Upgrade to <a href="//www.google.com/chrome">Chrome</a> version 25 or later.';			
					break;
				default:
					type = 'Unknown';
					message = 'Unknown message. ('+key+')';			
					break;
			}
		}

		if (this.modalIsOpen == false){
			this.modalIsOpen = true;
			this.modalOverlay = $.modal('<div><h1>'+type+'</h1><h4>'+message+'</h4></div>', {overlayClose:true});
		} else {
			this.modalIsOpen = false;
			this.modalOverlay = $.modal('<div><h1>'+type+'</h1><h4>'+message+'</h4></div>', {overlayClose:true});
		}
	}


	LiveSubbing.prototype.updateInterface = function(remote_displayname, remote_language_spoken, remote_text) {
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';

		var inputSelect_read = jQuery("#SelectRead");

		var local_language_read = this.languages_read[inputSelect_read.val()][1][0];
		if (remote_language_spoken != local_language_read){
			this.translationCounterID++;
			var self = this;
			// since we can't control when data is coming back we need to setup temp
			// function that are one time use. this will handle the data mix up that can 
			// happen when there are more than 2 people in a the hangout that require
			// the use of translation api. think of this as a temp que system but without
			// the overhead of building a full fledge data callback management system.
			window['translate'+self.translationCounterID] = function(response) {
        		var pTranslatedText = response.data.translations[0].translatedText;
				pTranslatedText 	= self.capitalize(pTranslatedText);
				var pText 			= remote_text;
				var pRemoteLanguage = remote_language_spoken;
				var pUser 			= remote_displayname;
        		self.displayTranslateText(pUser, pRemoteLanguage, pText, pTranslatedText);
        		setTimeout(function() {
	            	// remove the temporary function
    	        	window['translate'+self.translationCounterID] = null;
    	        }, 1000);
    		};

			// WARNING: be aware that YOUR-API-KEY inside html is viewable by all your users.
			// Restrict your key to designated domains or use a proxy to hide your key
			// to avoid misuage by other party.
			var source = 'https://www.googleapis.com/language/translate/v2?key=' + this.api_key + 
				'&source=' + remote_language_spoken + 
				'&target=' + local_language_read + 
				'&callback=translate' + this.translationCounterID +
				'&q=' + remote_text;

			newScript.src = source;
			// When we add this script to the head, the request is sent off.
			document.getElementsByTagName('head')[0].appendChild(newScript);
		} else {
			this.displayStraightText(remote_displayname, remote_language_spoken, remote_text);
		}
	}

	LiveSubbing.prototype.onStateChanged = function(event){
		if (event.state['remote_language_spoken'] != undefined && event.state['text'] != undefined) {
    		if (event.state['participant_id'] != gapi.hangout.getLocalParticipantId()) {
        		var remote_displayname = event.state['participant_name'];
        		var remote_language_spoken = event.state['remote_language_spoken'];
        		var remote_text = event.state['text'];
      			this.updateInterface(remote_displayname, remote_language_spoken, remote_text);
    		} 
  		}
	}	

	LiveSubbing.prototype.onApiReady = function(event){
		if(event.isApiReady){
			try {
				this.buildDOM();
				this.setupWebSpeech();
				this.scale();
				this.getParticipant();

				gapi.hangout.data.onStateChanged.add(this.onStateChanged.bind(this));

				if($.jStorage.get("notice") != "true"){
					$.modal('<div><h1>Notice</h1><h4>The overlay is mirrored. <br />It looks fine for everyone else!</h4></div>');
					$.jStorage.set("notice", "true");
				}
				this.showInfo('start');
			}
			catch(err) {
				//console.log(err);
			}
		}
	}

	window["appController"] = new LiveSubbing();
})()