document.getElementById("upload-button").addEventListener("click", async () => {
  const tagName = document.getElementById("tag-name-input").value;
  const videoFile = document.getElementById("video-file-input").files[0];

  if (!tagName || !videoFile) {
    alert("Please provide a tag name and select a video file.");
    return;
  }

  // Request a presigned URL for upload
  const response = await fetch("/generate-upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tagName }),
  });

  const data = await response.json();
  const { uploadUrl, uniqueFileName } = data;

  // Upload the file directly to S3 using the presigned URL
  await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
    },
    body: videoFile,
  });

  alert("Video uploaded successfully!");
  location.reload(); // Reload the page to refresh the video list
});

// Fetch and display the list of uploaded videos (by tag)
fetch("/videos")
  .then((response) => response.json())
  .then((tags) => {
    const videoList = document.getElementById("video-list");
    tags.forEach((tag) => {
      const videoItem = document.createElement("div");
      videoItem.className = "video-item";
      videoItem.innerHTML = `<div id='listed-video'><li>
          <a href="#" video-tag="${tag}">
            ${tag}
          </a></li>
          <button video-tag="${tag}">Delete</button></div>`;
      videoList.appendChild(videoItem);
    });

    // Add click event listener to each video link
    document.querySelectorAll(".video-item a").forEach((link) => {
      link.addEventListener("click", async function (event) {
        event.preventDefault();
        const tagName = this.getAttribute("video-tag");

        // Request a presigned URL for streaming
        const response = await fetch(`/get-video-url/${tagName}`);
        const data = await response.json();
        const { videoUrl } = data;

        playVideo(videoUrl);
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
  const videoPlayer = document.getElementById("video-player");
  const videoSource = document.getElementById("video-source");
  videoSource.src = src;
  videoPlayer.load();
  videoPlayer.play();
}

// Function to delete the video by tag
function deleteVideo(tagName) {
  fetch(`/delete-video/${tagName}`, {
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
