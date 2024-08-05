import WxVoice from 'wx-voice';
var voice = new WxVoice();

voice.on("error", (err) => {
  console.error("Error:", err);
});

voice.encode(
  "response.mp3", "output.silk", { format: "silk" },
  (file) => console.log("Encoded file saved as:", file)
);