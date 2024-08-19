// Fetch and display the list of uploaded videos (by tag)
fetch("/videos")
  .then((response) => response.json())
  .then((tags) => {
    const videoList = document.getElementById("videoList");
    tags.forEach((tag) => {
      const videoItem = document.createElement("div");
      videoItem.className = "video-item";
      videoItem.innerHTML = `<ul>
          <a href="#" video-tag="${tag}">
            ${tag}
          </a>
          <button video-tag="${tag}">Delete</button>
        </ul>`;
      videoList.appendChild(videoItem);
    });

    // Add click event listener to each video link
    document.querySelectorAll(".video-item a").forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const videoSrc = this.getAttribute("video-tag");
        playVideo(videoSrc);
      });
    });

    // Add click event listener to each delete button
    document.querySelectorAll(".video-item button").forEach((button) => {
      button.addEventListener("click", function () {
        const tagName = this.getAttribute("video-tag");
        deleteVideo(tagName);
      });
    });
  });

// Function to play the video by tag
function playVideo(src) {
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSource = document.getElementById("videoSource");
  videoSource.src = `/video/${src}`;
  videoPlayer.load();
  videoPlayer.play();
}

// Function to delete the video by tag
function deleteVideo(tagName) {
  fetch(`/video/${tagName}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        location.reload(); // Refresh the page to update the video list
      } else {
        alert("Failed to delete the video.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error deleting the video.");
    });
}
