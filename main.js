document.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.hash);   
});

window.addEventListener("hashchange", () => {
    navigateTo(window.location.hash);   
});

function navigateTo(hash) {
    switch (hash) {
        case "#/upload":
            loadUploadPage();
            break;
        case "#/gallery":
            loadGalleryPage();
            break;
        case "#/descriptions":
            loadDescriptionsPage(); 
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
            <a href="#/gallery">View Gallery</a><br><br>
            <a href="#/descriptions">View Descriptions</a>
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
    // Fetch both images and descriptions in parallel
    Promise.all([
        fetch('/images').then(response => response.json()),   // Fetch images data
        fetch('/descriptions').then(response => response.json()) // Fetch descriptions data
    ])
    .then(([imagesData, descriptionsData]) => {
        // Check if both responses have success and valid data
        if (imagesData.success && descriptionsData.success) {
            // Ensure images and descriptions arrays are of the same length
            if (imagesData.images.length === descriptionsData.posts.length) {
                const galleryContent = `
                    <div class="text-center my-4">
                        <h2>Image Gallery with Descriptions</h2>
                        <div class="gallery">
                            ${imagesData.images.map((image, index) => `
                                <div class="image-item">
                                    <img src="/uploads/${image}" alt="${image}" width="200" height="200">
                                    <p>${descriptionsData.posts[index]}</p> <!-- Display description under the image -->
                                </div>
                            `).join('')}
                        </div>
                        <a href="#/">Back to Home</a>
                    </div>`;

                document.getElementById("app").innerHTML = galleryContent;
            } else {
                // If the lengths don't match, show an error
                document.getElementById("app").innerHTML = '<p>Error: Images and descriptions do not match.</p>';
            }
        } else {
            // Handle errors in case either request fails
            document.getElementById("app").innerHTML = '<p>Error loading gallery and descriptions.</p>';
        }
    })
    .catch(err => {
        // Catch any errors from fetch or promise handling
        console.error(err);
        document.getElementById("app").innerHTML = '<p>Error loading gallery with descriptions.</p>';
    });
}

/*
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

function loadDescriptionsPage() {
    fetch('/descriptions')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load descriptions: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received from /descriptions:', data);  // Log the response to check its structure

        // Check if success and descriptions are both present
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
            const descriptionsContent = `
                <div class="text-center my-4">
                    <h2>Post Descriptions</h2>
                    <div class="descriptions-gallery">
                        ${data.posts.map(post => `
                            <div class="description-item">
                                <p>${post}</p>
                            </div>
                        `).join('')}
                    </div>
                    <a href="#/">Back to Home</a>
                </div>`;

            document.getElementById("app").innerHTML = descriptionsContent;
        } else {
            console.error('Descriptions are missing or not in the correct format.');
            document.getElementById("app").innerHTML = '<p>No descriptions available.</p>';
        }
    })
    .catch(err => {
        console.error('Error fetching descriptions:', err);
        document.getElementById("app").innerHTML = '<p>Error fetching descriptions.</p>';
    });
}
*/

  
loadHomePage(); // Default to loading the homepage on load
