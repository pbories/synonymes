var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var synth = window.speechSynthesis;

var outputPara = document.querySelector('.output');
var testBtn = document.querySelector('button');

const callApi = async (word) => {
  const response = await fetch(
      'https://api.dicolink.com/v1/mot/'
      + word
      + '/synonymes?api_key=DICOLINK_API_KEY' // Ask for a key there : https://www.dicolink.com/
  );

  return response.json(); //extract JSON from the http response
}

function testSpeech() {
  testBtn.disabled = true;
  testBtn.textContent = 'Ecoute en cours';

  outputPara.textContent = '...';

  var recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object 
    var speechResult = event.results[0][0].transcript.toLowerCase();

    callApi(speechResult).then(response => {
      var synonyms = '';

      for (i = 0; i < response.length; i++) {
        synonyms += response[i].mot;

        if (i === response.length - 1) {
          synonyms += '.';
          break;
        }

        synonyms += ', ';
      }

      var answer = 'Les synonymes de ' + speechResult + ', sont : ' + synonyms;
      console.log(answer);

      var utterThis = new SpeechSynthesisUtterance(answer);
      utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
      }

      utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
      }

      utterThis.voice = synth.getVoices().find(voice => {
        return voice.name === 'Thomas' && voice.lang === 'fr-FR';
      });

      synth.speak(utterThis);

      outputPara.textContent = answer;

      console.log('Confidence: ' + event.results[0][0].confidence);
    });
  }

  recognition.onspeechend = function() {
    recognition.stop();
    testBtn.disabled = false;
    testBtn.textContent = 'Recherche vocale';
  }

  recognition.onerror = function(event) {
    testBtn.disabled = false;
    testBtn.textContent = 'Recherche vocale';
    outputPara.textContent = 'Error occurred in recognition: ' + event.error;
  }
  
  recognition.onaudiostart = function(event) {
      //Fired when the user agent has started to capture audio.
      console.log('SpeechRecognition.onaudiostart');
  }
  
  recognition.onaudioend = function(event) {
      //Fired when the user agent has finished capturing audio.
      console.log('SpeechRecognition.onaudioend');
  }
  
  recognition.onend = function(event) {
      //Fired when the speech recognition service has disconnected.
      console.log('SpeechRecognition.onend');
  }
  
  recognition.onnomatch = function(event) {
      //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
      console.log('SpeechRecognition.onnomatch');
  }
  
  recognition.onsoundstart = function(event) {
      //Fired when any sound — recognisable speech or not — has been detected.
      console.log('SpeechRecognition.onsoundstart');
  }
  
  recognition.onsoundend = function(event) {
      //Fired when any sound — recognisable speech or not — has stopped being detected.
      console.log('SpeechRecognition.onsoundend');
  }
  
  recognition.onspeechstart = function (event) {
      //Fired when sound that is recognised by the speech recognition service as speech has been detected.
      console.log('SpeechRecognition.onspeechstart');
  }
  recognition.onstart = function(event) {
      //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
      console.log('SpeechRecognition.onstart');
  }
}

testBtn.addEventListener('click', testSpeech);
