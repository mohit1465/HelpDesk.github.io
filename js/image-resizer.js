const body = document.body;
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');
        const widthInput = document.getElementById('widthInput');
        const widthUnit = document.getElementById('widthUnit');
        const heightInput = document.getElementById('heightInput');
        const heightUnit = document.getElementById('heightUnit');
        const qualityInput = document.getElementById('qualityInput');
        const qualityValue = document.getElementById('qualityValue');
        const resizeButton = document.getElementById('resizeButton');
        const resetButton = document.getElementById('resetButton');
        const imageInfo = document.getElementById('imageInfo');
        const downloadButton = document.getElementById('downloadButton');
        const aspectLockBtn = document.getElementById('aspectLockBtn');
        const themeToggleBtn = document.getElementById('theme-toggle');
        const logoimg = document.getElementById('logo');
        const footerlogoimg = document.getElementById('footerLogo');


        let originalImage = null;
        let aspectRatio = 1;
        let isAspectLocked = false;
        let originalWidth = 0;
        let originalHeight = 0;



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
            } else {
                body.removeAttribute('data-theme');
            }
        }
        
        function isMobileDevice() {
            return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
        }
        
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
        
            if (currentTheme === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('currentTheme', 'light'); // Save theme
            } else {
                // Switch to dark theme
                body.setAttribute('data-theme', 'dark');
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









        // Aspect ratio lock functionality
        aspectLockBtn.addEventListener('click', function() {
            isAspectLocked = !isAspectLocked;
            this.innerHTML = isAspectLocked ? '🔒' : '🔓';
            this.classList.toggle('locked', isAspectLocked);
            
            if (isAspectLocked && originalImage) {
                aspectRatio = originalWidth / originalHeight;
            }
        });

        // Update quality value display
        qualityInput.addEventListener('input', function() {
            qualityValue.textContent = this.value + '%';
        });

        // Handle width/height changes to maintain aspect ratio
        widthInput.addEventListener('input', function() {
            if (isAspectLocked && aspectRatio) {
                const width = parseFloat(this.value);
                if (!isNaN(width)) {
                    heightInput.value = Math.round(width / aspectRatio);
                }
            }
        });

        heightInput.addEventListener('input', function() {
            if (isAspectLocked && aspectRatio) {
                const height = parseFloat(this.value);
                if (!isNaN(height)) {
                    widthInput.value = Math.round(height * aspectRatio);
                }
            }
        });

        // Handle unit changes
        widthUnit.addEventListener('change', function() {
            if (originalImage) {
                const currentValue = parseFloat(widthInput.value);
                if (!isNaN(currentValue)) {
                    // Convert to pixels first
                    const pixelValue = convertToPixels(currentValue, this.previousValue || 'px');
                    // Then convert to the new unit
                    widthInput.value = convertFromPixels(pixelValue, this.value);
                    this.previousValue = this.value;
                }
            }
        });

        heightUnit.addEventListener('change', function() {
            if (originalImage) {
                const currentValue = parseFloat(heightInput.value);
                if (!isNaN(currentValue)) {
                    // Convert to pixels first
                    const pixelValue = convertToPixels(currentValue, this.previousValue || 'px');
                    // Then convert to the new unit
                    heightInput.value = convertFromPixels(pixelValue, this.value);
                    this.previousValue = this.value;
                }
            }
        });

        imageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    originalImage = new Image();
                    originalImage.src = e.target.result;
                    originalImage.onload = function() {
                        imagePreview.src = originalImage.src;
                        originalWidth = originalImage.width;
                        originalHeight = originalImage.height;
                        aspectRatio = originalWidth / originalHeight;
                        
                        widthInput.value = originalWidth;
                        heightInput.value = originalHeight;
                        
                        displayImageInfo(file.size, originalWidth, originalHeight);
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        resizeButton.addEventListener('click', function() {
            if (!originalImage) {
                alert('Please select an image first');
                return;
            }
            
            this.classList.add('loading');
            this.textContent = 'Processing...';
            this.disabled = true;
            
            setTimeout(() => {
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
                    
                    resizeButton.classList.remove('loading');
                    resizeButton.textContent = 'Resize & Compress';
                    resizeButton.disabled = false;
                }, 'image/jpeg', quality);
            }, 100); // Small delay to allow the UI to update
        });

        resetButton.addEventListener('click', function() {
            if (originalImage) {
                imagePreview.src = originalImage.src;
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                qualityInput.value = 75;
                qualityValue.textContent = '75%';
                
                widthUnit.value = 'px';
                heightUnit.value = 'px';
                
                displayImageInfo(null, originalWidth, originalHeight);
                
                downloadButton.style.display = 'none';
            }
        });

        function displayImageInfo(size, width, height) {
            const infoHTML = `
                <p>File Size: ${size ? formatBytes(size) : 'N/A'}</p>
                <p>Width: ${Math.round(width)}px</p>
                <p>Height: ${Math.round(height)}px</p>
                <p>Aspect Ratio: ${aspectRatio ? aspectRatio.toFixed(2) : 'N/A'}</p>
            `;
            imageInfo.innerHTML = infoHTML;
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

        function convertFromPixels(pixels, unit) {
            const dpi = 96; // typical screen DPI
            if (unit === 'cm') {
                return (pixels * 2.54 / dpi).toFixed(2);
            } else if (unit === 'in') {
                return (pixels / dpi).toFixed(2);
            }
            return Math.round(pixels); // return as integer pixels
        }