document.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.hash);  // Handle initial navigation
});

window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash);  // Handle navigation on hash change
});

function navigateTo(hash) {
    switch (hash) {
        case "#/upload":
            loadUploadPage();
            break;
        case "#/gallery":
            loadGalleryPage();
            break;
        default:
            loadHomePage();
            break;
    }
}

function loadHomePage() {
    const homeContent = `
        <div class="text-center my-4">
            <h2>Welcome to Mo File Share!</h2>
            <p>Share your files and upload them easily.</p>
            <a href="#/upload">Upload a File</a><br><br>
            <a href="#/gallery">View Gallery</a>
        </div>`;
    document.getElementById("app").innerHTML = homeContent;
}

function loadUploadPage() {
    const uploadContent = `
        <div class="text-center my-4">
            <h2>Upload a File</h2>
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" name="image" required>
                <textarea name="description" placeholder="Enter description" required></textarea>
                <button type="submit">Upload</button>
            </form>
            <div id="uploadStatus"></div>
        </div>`;
    document.getElementById("app").innerHTML = uploadContent;

    // Handle the form submission
    document.getElementById("uploadForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("uploadStatus").textContent = data.success ? 'Upload successful!' : 'Upload failed.';
        })
        .catch(err => {
            console.error(err);
            document.getElementById("uploadStatus").textContent = 'An error occurred.';
        });
    });
}

function loadGalleryPage() {
    fetch('/images')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const galleryContent = `
                    <div class="text-center my-4">
                        <h2>Image Gallery</h2>
                        <div class="gallery">
                            ${data.images.map(image => `
                                <div class="image-item">
                                    <img src="/uploads/${image}" alt="${image}" width="200">
                                </div>
                            `).join('')}
                        </div>
                        <a href="#/">Back to Home</a>
                    </div>`;
                document.getElementById("app").innerHTML = galleryContent;
            } else {
                document.getElementById("app").innerHTML = '<p>No images found.</p>';
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById("app").innerHTML = '<p>Error loading gallery.</p>';
        });
}

loadHomePage(); // Default to loading the homepage on load
