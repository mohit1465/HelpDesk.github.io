const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const widthInput = document.getElementById('widthInput');
const widthUnit = document.getElementById('widthUnit');
const heightInput = document.getElementById('heightInput');
const heightUnit = document.getElementById('heightUnit');
const qualityInput = document.getElementById('qualityInput');
const resizeButton = document.getElementById('resizeButton');
const imageInfo = document.getElementById('imageInfo');
const downloadButton = document.getElementById('downloadButton');

let originalImage = null;

imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                imagePreview.src = originalImage.src;
                widthInput.value = originalImage.width;
                heightInput.value = originalImage.height;
                displayImageInfo(file.size, originalImage.width, originalImage.height);
            };
        };
        reader.readAsDataURL(file);
    }
});

resizeButton.addEventListener('click', function() {
    let width = parseFloat(widthInput.value);
    let height = parseFloat(heightInput.value);
    const quality = parseInt(qualityInput.value) / 100;

    width = convertToPixels(width, widthUnit.value);
    height = convertToPixels(height, heightUnit.value);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, width, height);

    canvas.toBlob(function(blob) {
        const resizedImageURL = URL.createObjectURL(blob);
        imagePreview.src = resizedImageURL;
        downloadButton.href = resizedImageURL;
        downloadButton.style.display = 'inline-block';
        displayImageInfo(blob.size, width, height);
    }, 'image/jpeg', quality);
});

function displayImageInfo(size, width, height) {
    imageData.innerHTML = `<p>File Size: ${formatBytes(size)}</p><p>Width: ${width}px</p><p>Height: ${height}px</p>`;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function convertToPixels(value, unit) {
    const dpi = 96; // typical screen DPI
    if (unit === 'cm') {
        return value * (dpi / 2.54); // 1 inch = 2.54 cm
    } else if (unit === 'in') {
        return value * dpi;
    }
    return value; // already in pixels
}
