// Gallery and lightbox functionality
document.addEventListener("DOMContentLoaded", function () {
  initGallery();
});

function initGallery() {
  const gallery = document.querySelector(".gallery");
  if (gallery) {
    gallery.addEventListener("click", handleGalleryClick);
  }
}

function handleGalleryClick(event) {
  const target = event.target;
  if (target.tagName === "IMG") {
    openLightbox(target.src);
  }
}

function openLightbox(imageUrl) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";

  const img = document.createElement("img");
  img.src = imageUrl;

  const closeButton = document.createElement("button");
  closeButton.className = "lightbox-close";
  closeButton.textContent = "×";
  closeButton.onclick = () => lightbox.remove();

  lightbox.appendChild(img);
  lightbox.appendChild(closeButton);
  document.body.appendChild(lightbox);

  // Close on background click
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      lightbox.remove();
    }
  });
}

// Optional: Add keyboard navigation
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const lightbox = document.querySelector(".lightbox");
    if (lightbox) {
      lightbox.remove();
    }
  }
});
