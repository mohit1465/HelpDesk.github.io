const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const logoimg = document.getElementById('logo');
const uploadImage = document.getElementById('uploadImage');

window.onload = () => {
    if (isMobileDevice()) {
        document.body.innerHTML = '<h1>This website is not available on mobile devices. Please use a desktop.</h1>';
    }
    const savedTheme = localStorage.getItem('currentTheme') || 'light';
    setTheme(savedTheme);
};

function setTheme(theme) {
    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/Text Editor logo dark.png';
    } else {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/Text Editor logo light.png';
    }
}

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/Text Editor logo light.png';
        localStorage.setItem('currentTheme', 'light'); // Save theme
    } else {
        // Switch to dark theme
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/Text Editor logo dark.png';
        localStorage.setItem('currentTheme', 'dark'); // Save theme
    }
});


function toggleBox(event) {
    const outerBox = document.querySelector('.outer-box');
    outerBox.style.transform = outerBox.style.transform === 'translateY(0%)' 
                                ? 'translateY(100%)' 
                                : 'translateY(0%)';
}

window.addEventListener('click', function(event) {
    const iconLink = document.querySelector('.menu-icon');
    const outerBox = document.querySelector('.outer-box');

    if (!iconLink.contains(event.target) && !outerBox.contains(event.target)) {
        outerBox.style.transform = 'translateY(100%)';
    }

    window.addEventListener('scroll', function() {
        outerBox.style.transform = 'translateY(100%)';
    });
});


const imageUpload = document.getElementById('imageUpload');
const previewImage = document.getElementById('preview');
const imageGallery = document.getElementById('imageGallery');
const downloadContainer = document.getElementById('downloadContainer');
const dropZone = document.getElementById('dropZone');
const leftSubSideBar = document.getElementById('leftSubSideBar');
const fileInput = document.getElementById('fileInput');

const cropButton = document.getElementById('cropButton');

const image = document.getElementById('image');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const saturation = document.getElementById('saturation');
const blur = document.getElementById('blur');
const invert = document.getElementById('invert');
const sepia = document.getElementById('sepia');
const grayscale = document.getElementById('grayscale');
const hue = document.getElementById('hue');

const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');
const saturationValue = document.getElementById('saturationValue');
const blurValue = document.getElementById('blurValue');
const hueValue = document.getElementById('hueValue');
const imageData = document.getElementById('imageData');

let currentOrientation = {
    flipHorizontal: false,
    flipVertical: false,
    rotateDeg: 0
};

let currentFilter = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    invert: 0,
    sepia: 0,
    grayscale: 0,
    hue: 0
};

let images = [];

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.leftMenuBtns');
    const mainDiv = document.getElementById('leftSubSideBar');
    let activeSubDiv = null;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const subDiv = document.getElementById(id);

            if (activeSubDiv === subDiv) {
                    mainDiv.style.display = 'none';
                    activeSubDiv = null;

                    button.classList.remove('left-active-button');
            } else {
                mainDiv.style.display = 'block';

                document.querySelectorAll('.sub-div').forEach(div => {
                    div.style.display = 'none';
                });

                subDiv.style.display = 'block';
                activeSubDiv = subDiv;

                buttons.forEach(btn => btn.classList.remove('left-active-button'));
                button.classList.add('left-active-button');
            }
        });
    });
});

// Handle file uploads through input
imageUpload.addEventListener('change', (e) => handleFiles(e.target.files));

let isDraggingFromGallery = false; // Flag to track if dragging is from the gallery

// Modify drop zone-related event listeners
window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (!isDraggingFromGallery) {
        dropZone.style.display = 'flex';
    }
});

window.addEventListener('dragover', (e) => {
    e.preventDefault();
});

window.addEventListener('dragleave', (e) => {
    if (!isDraggingFromGallery && e.relatedTarget === null) {
        dropZone.style.display = 'none';
    }
});

window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!isDraggingFromGallery) {
        dropZone.style.display = 'none';
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }
});

function enableDragAndDrop() {
    let draggedElement = null;

    // Enable dragging on the img tag within img-wrapper
    imageGallery.addEventListener('dragstart', (e) => {
        const img = e.target.closest('img');
        isDraggingFromGallery = true;
        if (img && img.parentElement.classList.contains('img-wrapper')) {
            const imgWrapper = img.parentElement;
            imgWrapper.classList.add('dragging');
            draggedElement = imgWrapper; // Store the dragged element
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', ''); // Required for drag-and-drop in some browsers
        }
    });

    imageGallery.addEventListener('dragend', (e) => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
        draggedElement = null;
        isDraggingFromGallery = false;
    });

    imageGallery.addEventListener('dragover', (e) => {
        e.preventDefault();
        isDraggingFromGallery = true;
        const draggingElement = document.querySelector('.dragging');
        const sibling = getDragAfterElement(imageGallery, e.clientY);

        // Allow dropping in the first position
        if (draggingElement) {
            imageGallery.insertBefore(draggingElement, sibling || null);
        }
    });

    imageGallery.addEventListener('drop', (e) => {
        e.preventDefault(); // Prevent default browser behavior (e.g., duplicating elements)
        e.stopPropagation(); // Stop propagation to avoid conflicts
        updateImageOrder();
        draggedElement.classList.remove('dragging');
        draggedElement = null;
        isDraggingFromGallery = false; // Reset flag after drop
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.img-wrapper:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

// Update the order of images in the `images` array
function updateImageOrder() {
    const imgWrappers = imageGallery.querySelectorAll('.img-wrapper');
    images = Array.from(imgWrappers).map(wrapper => {
        const img = wrapper.querySelector('img');
        return images.find(image => image.src === img.src);
    });

    // Update image numbers
    imgWrappers.forEach((wrapper, index) => {
        const imgNumber = wrapper.querySelector('.img-number');
        imgNumber.textContent = index + 1;
    });
}

// Display uploaded images with drag-and-drop functionality
function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const imgData = {
            src: event.target.result,
            name: file.name,
            orientation: { ...currentOrientation },
            filter: { ...currentFilter }
        };
        images.push(imgData);

        // Create a wrapper for the image
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('img-wrapper');
        imgWrapper.draggable = true; // Make the wrapper draggable

        // Create the image element
        const imgElement = document.createElement('img');
        imgElement.src = event.target.result;
        imgElement.alt = file.name;
        imgElement.onclick = () => showImagePreview(imgData);

        // Create the cross button for removing the image
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-btn');
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Do you want to remove this file?')) {
                imgWrapper.remove();
                images.splice(images.indexOf(imgData), 1); // Remove the image from the list
                updateImageOrder();
                previewImage.style.display = "none";
                uploadImage.style.display = "block";
            }
        };

        // Add image number
        const imgNumber = document.createElement('span');
        imgNumber.classList.add('img-number');
        imgNumber.textContent = images.length;

        // Append elements to the wrapper
        imgWrapper.appendChild(imgElement);
        imgWrapper.appendChild(removeBtn);
        imgWrapper.appendChild(imgNumber);

        // Append the wrapper to the gallery
        imageGallery.appendChild(imgWrapper);
    };
    reader.readAsDataURL(file);
}

// Initialize drag-and-drop functionality
document.addEventListener('DOMContentLoaded', () => {
    enableDragAndDrop();
});

// // Display uploaded images
// function displayImage(file) {
//     const reader = new FileReader();
//     reader.onload = function (event) {
//         const imgData = {
//             src: event.target.result,
//             name: file.name,
//             orientation: { ...currentOrientation },
//             filter: { ...currentFilter }
//         };
//         images.push(imgData);

//         // Create a wrapper for the image
//         const imgWrapper = document.createElement('div');
//         imgWrapper.classList.add('img-wrapper');

//         // Create the image element
//         const imgElement = document.createElement('img');
//         imgElement.src = event.target.result;
//         imgElement.alt = file.name;
//         imgElement.onclick = () => showImagePreview(imgData);

//         // Create the cross button for removing the image
//         const removeBtn = document.createElement('button');
//         removeBtn.classList.add('remove-btn');
//         removeBtn.innerHTML = '&times;';
//         removeBtn.onclick = (e) => {
//             e.stopPropagation();
//             if (confirm('Do you want to remove this file?')) {
//                 imgWrapper.remove();
//                 images.splice(images.indexOf(imgData), 1); // Remove the image from the list
//                 previewImage.style.display = "none";
//                 uploadImage.style.display = "block";
//             }
//         };

//         // Add image number
//         const imgNumber = document.createElement('span');
//         imgNumber.classList.add('img-number');
//         imgNumber.textContent = images.length;

//         // Append elements to the wrapper
//         imgWrapper.appendChild(imgElement);
//         imgWrapper.appendChild(removeBtn);
//         imgWrapper.appendChild(imgNumber);

//         // Append the wrapper to the gallery
//         imageGallery.appendChild(imgWrapper);
//     };
//     reader.readAsDataURL(file);
// }


// Handle ZIP Files
async function handleZipFile(zipFile) {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    for (const filename of Object.keys(zipContent.files)) {
        const file = zipContent.files[filename];
        const blob = await file.async('blob');

        if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            displayImage(new File([blob], filename));
        } else if (filename.endsWith('.pdf')) {
            const pdfFile = new File([blob], filename, { type: 'application/pdf' });
            await handlePdfFile(pdfFile);
        }
    }
}

// Handle PDF Files
async function handlePdfFile(pdfFile) {
    const pdfDoc = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        canvas.toBlob((blob) => {
            displayImage(new File([blob], `page-${i}.jpg`));
        }, 'image/jpeg');
    }
}

async function handleFiles(files) {
    for (const file of files) {
        if (file.name.endsWith('.zip')) {
            await handleZipFile(file);
        } else if (file.type === 'application/pdf') {
            await handlePdfFile(file);
        } else if (file.type.startsWith('image/')) {
            displayImage(file);
        } else {
            alert(`${file.name} is not a supported file type.`);
        }
    }
}

const applyOriAllBtn = document.getElementById('applyOriAllBtn');
const applyFilterAllBtn = document.getElementById('applyFilterAllBtn');

// Function to update all images with orientation and filter
function applyOrientationToAllImages() {
    const imagesInGallery = imageGallery.getElementsByTagName('img');
    for (let img of imagesInGallery) {
        img.style.transform = `
            rotate(${currentOrientation.rotateDeg}deg)
            scaleX(${currentOrientation.flipHorizontal ? -1 : 1})
            scaleY(${currentOrientation.flipVertical ? -1 : 1})
        `;
    }
}

function applyFilterToAllImages() {
    const imagesInGallery = imageGallery.getElementsByTagName('img');
    for (let img of imagesInGallery) {
        img.style.filter = `
            brightness(${currentFilter.brightness}%)
            contrast(${currentFilter.contrast}%)
            saturate(${currentFilter.saturation}%)
            blur(${currentFilter.blur}px)
            invert(${currentFilter.invert})
            sepia(${currentFilter.sepia})
            grayscale(${currentFilter.grayscale})
            hue-rotate(${currentFilter.hue}deg)
        `;
    }
}

// Apply orientation to all images in the gallery
applyOriAllBtn.addEventListener('click', () => {
    images.forEach(img => {
        img.orientation = { ...currentOrientation };
    });
    applyOrientationToAllImages();
});

// Apply filter to all images in the gallery
applyFilterAllBtn.addEventListener('click', () => {
    images.forEach(img => {
        img.filter = { ...currentFilter };
    });
    applyFilterToAllImages();
});

function showImagePreview(selectedImage) {
    previewImage.src = selectedImage.src;
    previewImage.style.display = "block";
    uploadImage.style.display = "none";
    imageData.style.display = 'flex';

// When image is loaded, calculate and display info
previewImage.onload = () => {
    const fileSize = atob(previewImage.src.split(',')[1]).length; // Get size in bytes
    const naturalWidth = previewImage.naturalWidth; // Get natural width
    const naturalHeight = previewImage.naturalHeight; // Get natural height

    // Display the information
    displayImageInfo(fileSize, naturalWidth, naturalHeight);
};

    currentOrientation = { ...selectedImage.orientation };
    currentFilter = { ...selectedImage.filter };

    brightness.value = currentFilter.brightness || 100;
    contrast.value = currentFilter.contrast || 100;
    saturation.value = currentFilter.saturation || 100;
    blur.value = currentFilter.blur || 0;
    invert.checked = currentFilter.invert || 0;
    sepia.checked = currentFilter.sepia || 0;
    grayscale.checked = currentFilter.grayscale || 0;
    hue.value = currentFilter.hue || 0;

    updateImageOrientation();
    updateFilters();

    const galleryImages = imageGallery.querySelectorAll('img');
    galleryImages.forEach(img => img.classList.remove('selectedImage'));

    // Normalize both src values to absolute URLs for reliable comparison
    const clickedImage = Array.from(galleryImages).find(img => new URL(img.src, document.baseURI).href === new URL(selectedImage.src, document.baseURI).href);
    if (clickedImage) {
        clickedImage.classList.add('selectedImage');
    }
    console.log(previewImage);
}

function displayImageInfo(size, width, height) {
    imageData.innerHTML = `<p><b>File Size: </b>${formatBytes(size)}</p><p><b>Width: </b>${width}px</p><p><b>Height: </b>${height}px</p>`;
    console.log(`File Size: ${formatBytes(size)}<br>Width: ${width}px<br>Height: ${height}px`);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// filter Update
function updateFilters() {
    if (!previewImage.src) return;

    const galleryImages = document.querySelectorAll('#imageGallery img');

    galleryImages.forEach(image => {
        if (image.src === previewImage.src) {
        selectedImage = image;
        }
    });

    const brightnessValue = currentFilter.brightness;
    const contrastValue = currentFilter.contrast;
    const saturationValue = currentFilter.saturation;
    const blurValue = currentFilter.blur;
    const invertValue = currentFilter.invert ? 'invert(100%)' : 'invert(0%)';
    const sepiaValue = currentFilter.sepia ? 'sepia(1)' : 'sepia(0)';
    const grayscaleValue = currentFilter.grayscale ? 'grayscale(1)' : 'grayscale(0)';
    const hueValue = `hue-rotate(${currentFilter.hue}deg)`;

    // Apply the filter to the preview image
    previewImage.style.filter = `
        brightness(${brightnessValue}%)
        contrast(${contrastValue}%)
        saturate(${saturationValue}%)
        blur(${blurValue}px)
        ${invertValue}
        ${sepiaValue}
        ${grayscaleValue}
        ${hueValue}
    `;

    selectedImage.style.filter = `
        brightness(${brightnessValue}%)
        contrast(${contrastValue}%)
        saturate(${saturationValue}%)
        blur(${blurValue}px)
        ${invertValue}
        ${sepiaValue}
        ${grayscaleValue}
        ${hueValue}
    `;

    saveCurrentFilter();
}

function saveCurrentFilter() {
    const selectedImage = images.find(img => img.src === previewImage.src);
    if (selectedImage) {
        selectedImage.filter = { ...currentFilter }; // Save the current filter settings
    }
}

// Add event listeners to sliders
function setupSliderListeners(slider, input, filterName) {
    slider.addEventListener('input', (e) => {
        currentFilter[filterName] = e.target.value;
        updateFilters();
        saveCurrentFilter();
        input.value = e.target.value;
    });

    input.addEventListener('input', () => {
        const value = Math.min(Math.max(input.value, input.min), input.max);
        slider.value = value;
        input.value = value;
        currentFilter[filterName] = value;
        updateFilters();
        saveCurrentFilter();
    });
}

// Initialize listeners for each filter
setupSliderListeners(brightness, brightnessValue, 'brightness');
setupSliderListeners(contrast, contrastValue, 'contrast');
setupSliderListeners(saturation, saturationValue, 'saturation');
setupSliderListeners(blur, blurValue, 'blur');
setupSliderListeners(hue, hueValue, 'hue');


// Event listeners for filter controls
brightness.addEventListener('input', (e) => {
    currentFilter.brightness = e.target.value;
    updateFilters();
    saveCurrentFilter();
});
contrast.addEventListener('input', (e) => {
    currentFilter.contrast = e.target.value;
    updateFilters();
    saveCurrentFilter();
});
saturation.addEventListener('input', (e) => {
    currentFilter.saturation = e.target.value;
    updateFilters();
    saveCurrentFilter();
});
blur.addEventListener('input', (e) => {
    currentFilter.blur = e.target.value;
    updateFilters();
    saveCurrentFilter();
});
invert.addEventListener('change', (e) => {
    currentFilter.invert = e.target.checked ? 1 : 0;
    updateFilters();
    saveCurrentFilter();
});
sepia.addEventListener('change', (e) => {
    currentFilter.sepia = e.target.checked ? 1 : 0;
    updateFilters();
    saveCurrentFilter();
});
grayscale.addEventListener('change', (e) => {
    currentFilter.grayscale = e.target.checked ? 1 : 0;
    updateFilters();
    saveCurrentFilter();
});
hue.addEventListener('input', (e) => {
    currentFilter.hue = e.target.value;
    updateFilters();
    saveCurrentFilter();
});

// Update Image Orientation
function updateImageOrientation() {
    if (!previewImage.src) return;

    const galleryImages = document.querySelectorAll('#imageGallery img');

    galleryImages.forEach(image => {
        if (image.src === previewImage.src) {
        selectedImage = image;
        }
    });

    previewImage.style.transform = `
        ${currentOrientation.flipHorizontal ? 'scaleX(-1)' : 'scaleX(1)'}
        ${currentOrientation.flipVertical ? 'scaleY(-1)' : 'scaleY(1)'}
        rotate(${currentOrientation.rotateDeg}deg)
    `;

    selectedImage.style.transform = `
        ${currentOrientation.flipHorizontal ? 'scaleX(-1)' : 'scaleX(1)'}
        ${currentOrientation.flipVertical ? 'scaleY(-1)' : 'scaleY(1)'}
        rotate(${currentOrientation.rotateDeg}deg)
    `;

    // Save the orientation changes for the selected image
    saveCurrentOrientation();
}

// Save Current Orientation
function saveCurrentOrientation() {
    const selectedImage = images.find(img => img.src === previewImage.src);
    if (selectedImage) {
        selectedImage.orientation = { ...currentOrientation };
    }
}

// Transformation Controls
document.getElementById('flipHorizontal').addEventListener('click', () => {
    currentOrientation.flipHorizontal = !currentOrientation.flipHorizontal;
    updateImageOrientation();
    saveCurrentOrientation();
});

document.getElementById('flipVertical').addEventListener('click', () => {
    currentOrientation.flipVertical = !currentOrientation.flipVertical;
    updateImageOrientation();
    saveCurrentOrientation();
});

document.getElementById('rotateLeft').addEventListener('click', () => {
    currentOrientation.rotateDeg -= 90;
    updateImageOrientation();
    saveCurrentOrientation();
});

document.getElementById('rotateRight').addEventListener('click', () => {
    currentOrientation.rotateDeg += 90;
    updateImageOrientation();
    saveCurrentOrientation();
});

// Download section
const downloadButton = document.getElementById('downloadButton');
const downloadOptions = document.getElementById('downloadOptions');

const { jsPDF } = window.jspdf;

downloadButton.addEventListener('click', () => {
    if (downloadOptions.classList.contains('hidden')) {
        downloadOptions.classList.remove('hidden');
        downloadOptions.classList.add('visible');
    } else {
        downloadOptions.classList.remove('visible');
        downloadOptions.classList.add('hidden');
    }
});

// Parse indices
function parseIndices(input) {
    const ranges = input.split(',');
    const indices = [];
    ranges.forEach(range => {
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            for (let i = start; i <= end; i++) indices.push(i - 1);
        } else {
            indices.push(Number(range) - 1);
        }
    });
    return indices.filter(index => index >= 0 && index < images.length);
}

// Confirm Download
confirmDownload.addEventListener('click', async () => {
    const indices = parseIndices(imageSelection.value);
    const type = exportType.value;

    if (indices.length === 0) {
        alert('No valid images selected.');
        return;
    }

    const selectedImages = indices.map(index => images[index]);

    if (type === 'zip') {
        const zip = new JSZip();

        for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i];
            const img = new Image();
            img.src = image.src;

            await new Promise(resolve => img.onload = resolve);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Get original width, height, and orientation
            const width = img.width;
            const height = img.height;
            const angle = (image.orientation.rotateDeg % 360) * Math.PI / 180;

            let newWidth = width;
            let newHeight = height;
            if (Math.abs(image.orientation.rotateDeg) % 180 === 90) {
                newWidth = height;
                newHeight = width;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Rotate and flip the canvas
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle);
            ctx.scale(image.orientation.flipHorizontal ? -1 : 1, image.orientation.flipVertical ? -1 : 1);

            // Apply unique filters for the current image
            const filter = image.filter || {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                blur: 0,
                invert: false,
                sepia: false,
                grayscale: false,
                hue: 0,
            };

            ctx.filter = `
                brightness(${filter.brightness}%)
                contrast(${filter.contrast}%)
                saturate(${filter.saturation}%)
                blur(${filter.blur}px)
                ${filter.invert ? 'invert(100%)' : 'invert(0%)'}
                ${filter.sepia ? 'sepia(1)' : 'sepia(0)'}
                ${filter.grayscale ? 'grayscale(1)' : 'grayscale(0)'}
                hue-rotate(${filter.hue}deg)
            `;

            // Draw the image
            ctx.drawImage(img, -width / 2, -height / 2);

            // Add the transformed image to the ZIP file
            const transformedImageData = canvas.toDataURL('image/png');
            const extension = image.src.startsWith('data:image/jpeg') ? 'jpg' : 'png';
            zip.file(`image_${i + 1}.${extension}`, transformedImageData.split(',')[1], { base64: true });
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'images.zip';
        link.click();
    } else if (type === 'pdf') {
        const pdf = new jsPDF();

        for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i];
            const img = new Image();
            img.src = image.src;

            await new Promise(resolve => img.onload = resolve);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const width = img.width;
            const height = img.height;
            const angle = (image.orientation.rotateDeg % 360) * Math.PI / 180;

            let newWidth = width;
            let newHeight = height;
            if (Math.abs(image.orientation.rotateDeg) % 180 === 90) {
                newWidth = height;
                newHeight = width;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle);
            ctx.scale(image.orientation.flipHorizontal ? -1 : 1, image.orientation.flipVertical ? -1 : 1);

            const filter = image.filter || {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                blur: 0,
                invert: false,
                sepia: false,
                grayscale: false,
                hue: 0,
            };

            ctx.filter = `
                brightness(${filter.brightness}%)
                contrast(${filter.contrast}%)
                saturate(${filter.saturation}%)
                blur(${filter.blur}px)
                ${filter.invert ? 'invert(100%)' : 'invert(0%)'}
                ${filter.sepia ? 'sepia(1)' : 'sepia(0)'}
                ${filter.grayscale ? 'grayscale(1)' : 'grayscale(0)'}
                hue-rotate(${filter.hue}deg)
            `;

            ctx.drawImage(img, -width / 2, -height / 2);

            const transformedImageData = canvas.toDataURL('image/jpeg');
            const imgWidth = 210;
            const imgHeight = (newHeight / newWidth) * imgWidth;

            if (i > 0) pdf.addPage();
            pdf.addImage(transformedImageData, 'JPEG', 0, 0, imgWidth, imgHeight);
        }

        pdf.save('images.pdf');

    } else {
        selectedImages.forEach(image => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image.src;

            img.onload = () => {
                const width = img.width;
                const height = img.height;
                const angle = (image.orientation.rotateDeg % 360) * Math.PI / 180;

                let newWidth = width;
                let newHeight = height;
                if (Math.abs(image.orientation.rotateDeg) % 180 === 90) {
                    newWidth = height;
                    newHeight = width;
                }

                canvas.width = newWidth;
                canvas.height = newHeight;

                // Rotate and flip the canvas
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(angle);
                ctx.scale(image.orientation.flipHorizontal ? -1 : 1, image.orientation.flipVertical ? -1 : 1);

                // Apply unique filters for the current image
                const filter = image.filter || {
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    blur: 0,
                    invert: false,
                    sepia: false,
                    grayscale: false,
                    hue: 0,
                };

                ctx.filter = `
                    brightness(${filter.brightness}%)
                    contrast(${filter.contrast}%)
                    saturate(${filter.saturation}%)
                    blur(${filter.blur}px)
                    ${filter.invert ? 'invert(100%)' : 'invert(0%)'}
                    ${filter.sepia ? 'sepia(1)' : 'sepia(0)'}
                    ${filter.grayscale ? 'grayscale(1)' : 'grayscale(0)'}
                    hue-rotate(${filter.hue}deg)
                `;

                // Draw the image on the canvas
                ctx.drawImage(img, -width / 2, -height / 2);

                // Create a download link for the transformed image
                const link = document.createElement('a');
                const extension = image.src.startsWith('data:image/jpeg') ? 'jpg' : 'png';
                link.href = canvas.toDataURL(`image/${extension}`);
                link.download = `transformed_${image.name}`;
                link.click();
            };
        });
    }
});
