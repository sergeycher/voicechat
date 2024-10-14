const MIN_DECIBELS = -45;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const audioChunks: Blob[] = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const audioContext = new AudioContext();
    const audioStreamSource = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.minDecibels = MIN_DECIBELS;
    audioStreamSource.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const domainData = new Uint8Array(bufferLength);

    let soundDetected = false;

    const detectSound = () => {
      if (soundDetected) {
        return
      }

      analyser.getByteFrequencyData(domainData);

      for (let i = 0; i < bufferLength; i++) {
        const value = domainData[i];

        if (domainData[i] > 0) {
          soundDetected = true
        }
      }

      window.requestAnimationFrame(detectSound);
    };

    window.requestAnimationFrame(detectSound);

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      console.log({ soundDetected });
    });
  });
