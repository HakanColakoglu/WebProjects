// Fetch and display the list of uploaded videos
fetch("/videos")
  .then((response) => response.json())
  .then((videos) => {
    const videoList = document.getElementById("videoList");
    videos.forEach((video) => {
      const videoItem = document.createElement("div");
      videoItem.className = "video-item";
      videoItem.innerHTML = `<ul><a href="#" data-video="/video/${video}">${video}</a></ul>`;
      videoList.appendChild(videoItem);
    });

    // Add click event listener to each video link
    document.querySelectorAll(".video-item a").forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const videoSrc = this.getAttribute("data-video");
        playVideo(videoSrc);
      });
    });
  });

// Function to play the video
function playVideo(src) {
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSource = document.getElementById("videoSource");
  videoSource.src = src;
  videoPlayer.load();
  videoPlayer.play();
}
