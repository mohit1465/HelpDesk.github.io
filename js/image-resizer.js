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
        const reselectButton = document.getElementById('reselectButton');
        const previewContainer = document.querySelector('.preview-container');
        const cropButton = document.getElementById('cropButton');
        const cropImage = document.getElementById('cropImage');
        const cropCancel = document.getElementById('cropCancel');
        const cropDone = document.getElementById('cropDone');
        const previewContent = document.querySelector('.preview-content');
        const cropContent = document.querySelector('.crop-content');
        const bgRemoveButton = document.getElementById('bgRemoveButton');

        let cropper = null;
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
        

        function toggleUserMenu() {
            const userMenu = document.getElementById('user-menu');
            
            // Toggle the visibility of the user menu
            if (userMenu.style.display === 'none' || userMenu.style.display === '') {
                userMenu.style.display = 'block';
            } else {
                userMenu.style.display = 'none';
            }
        
            // Hide the user menu if clicking outside
            document.addEventListener('click', function(event) {
                const isClickInside = userMenu.contains(event.target);
                const isButtonClick = event.target.closest('.icon-link'); // Check if clicked element is the icon
        
                if (!isClickInside && !isButtonClick) {
                    userMenu.style.display = 'none';
                }
            });
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
                // Update height based on current width
                const width = parseFloat(widthInput.value);
                if (!isNaN(width)) {
                    const widthInPixels = convertToPixels(width, widthUnit.value);
                    const heightInPixels = widthInPixels / aspectRatio;
                    heightInput.value = convertFromPixels(heightInPixels, widthUnit.value);
                }
            }
        });

        // Update quality value display
        qualityInput.addEventListener('input', function() {
            qualityValue.textContent = this.value + '%';
        });

        // Handle unit changes
        widthUnit.addEventListener('change', function() {
            if (originalImage) {
                const currentWidth = parseFloat(widthInput.value);
                const currentHeight = parseFloat(heightInput.value);
                if (!isNaN(currentWidth) && !isNaN(currentHeight)) {
                    // Convert to pixels first
                    const widthInPixels = convertToPixels(currentWidth, this.previousValue || 'px');
                    const heightInPixels = convertToPixels(currentHeight, this.previousValue || 'px');
                    // Then convert to the new unit
                    widthInput.value = convertFromPixels(widthInPixels, this.value);
                    heightInput.value = convertFromPixels(heightInPixels, this.value);
                    this.previousValue = this.value;
                }
            }
        });

        // Handle width/height changes to maintain aspect ratio
        widthInput.addEventListener('input', function() {
            if (isAspectLocked && aspectRatio) {
                const width = parseFloat(this.value);
                if (!isNaN(width)) {
                    const widthInPixels = convertToPixels(width, widthUnit.value);
                    const heightInPixels = widthInPixels / aspectRatio;
                    heightInput.value = convertFromPixels(heightInPixels, widthUnit.value);
                }
            }
        });

        heightInput.addEventListener('input', function() {
            if (isAspectLocked && aspectRatio) {
                const height = parseFloat(this.value);
                if (!isNaN(height)) {
                    const heightInPixels = convertToPixels(height, widthUnit.value);
                    const widthInPixels = heightInPixels * aspectRatio;
                    widthInput.value = convertFromPixels(widthInPixels, widthUnit.value);
                }
            }
        });

        // Crop button click handler
        cropButton.addEventListener('click', function() {
            if (!originalImage) {
                alert('Please select an image first');
                return;
            }

            // Show crop interface
            previewContent.style.display = 'none';
            cropContent.style.display = 'block';
            cropImage.src = originalImage.src;

            // Initialize cropper
            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(cropImage, {
                aspectRatio: NaN,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        });

        // Cancel crop
        cropCancel.addEventListener('click', function() {
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            cropContent.style.display = 'none';
            previewContent.style.display = 'block';
        });

        // Apply crop
        cropDone.addEventListener('click', function() {
            if (!cropper) return;

            const canvas = cropper.getCroppedCanvas({
                maxWidth: 4096,
                maxHeight: 4096,
                fillColor: 'transparent',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            // Check if image has transparency
            const hasTransparency = previewContainer.classList.contains('has-transparent-bg');
            const format = hasTransparency ? 'image/png' : 'image/jpeg';

            // Update the image preview with cropped image
            const croppedImageUrl = canvas.toDataURL(format);
            imagePreview.src = croppedImageUrl;
            originalImage = new Image();
            originalImage.src = croppedImageUrl;
            originalImage.onload = function() {
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                aspectRatio = originalWidth / originalHeight;
                
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                
                displayImageInfo(null, originalWidth, originalHeight);
            };

            // Show download button
            downloadButton.style.display = 'inline-block';
            downloadButton.href = croppedImageUrl;
            downloadButton.download = hasTransparency ? 'cropped-image.png' : 'cropped-image.jpg';

            // Clean up
            cropper.destroy();
            cropper = null;
            cropContent.style.display = 'none';
            previewContent.style.display = 'block';
        });

        // Add click handler for preview container
        previewContainer.addEventListener('click', (e) => {
            // Don't trigger if clicking the reselect button
            if (e.target === reselectButton || reselectButton.contains(e.target)) {
                return;
            }
            // Only open file explorer if no image is selected
            if (!originalImage) {
                imageInput.click();
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
                        reselectButton.style.display = 'flex'; // Show reselect button
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

                // Convert to pixels first
                width = convertToPixels(width, widthUnit.value);
                height = convertToPixels(height, widthUnit.value);

                // Calculate the new aspect ratio
                const newAspectRatio = width / height;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                
                // Clear canvas with transparency
                ctx.clearRect(0, 0, width, height);
                
                // Draw image
                ctx.drawImage(originalImage, 0, 0, width, height);

                // Use PNG format if image has transparency
                const format = previewContainer.classList.contains('has-transparent-bg') ? 'image/png' : 'image/jpeg';
                
                canvas.toBlob(function(blob) {
                    const resizedImageURL = URL.createObjectURL(blob);
                    imagePreview.src = resizedImageURL;
                    downloadButton.href = resizedImageURL;
                    downloadButton.style.display = 'inline-block';
                    downloadButton.download = format === 'image/png' ? 'resized-image.png' : 'resized-image.jpg';
                    
                    // Update image info with new dimensions and ratio
                    const infoHTML = `
                        <p>File Size: ${formatBytes(blob.size)}</p>
                        <p>${Math.round(width)} x ${Math.round(height)} px</p>
                        <p>Aspect Ratio: ${newAspectRatio.toFixed(2)} (Original: ${aspectRatio.toFixed(2)})</p>
                    `;
                    imageInfo.innerHTML = infoHTML;
                    
                    resizeButton.classList.remove('loading');
                    resizeButton.textContent = 'Resize & Compress';
                    resizeButton.disabled = false;
                }, format, quality);
            }, 100);
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
                previewContainer.classList.remove('has-transparent-bg');
            }
        });

        function displayImageInfo(size, width, height) {
            const infoHTML = `
                <p>File Size: ${size ? formatBytes(size) : 'N/A'}</p>
                <p>${Math.round(width)} x ${Math.round(height)} px</p>
                <p>Aspect Ratio: ${aspectRatio.toFixed(2)}</p>
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

        // Add reselect button click handler
        reselectButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering preview container click
            imageInput.click();
        });

        // Hide reselect button initially
        reselectButton.style.display = 'none';

        // Background removal functionality
        bgRemoveButton.addEventListener('click', async function() {
            if (!originalImage) {
                alert('Please select an image first');
                return;
            }

            // Check if user is logged in
            const user = firebase.auth().currentUser;
            if (!user) {
                alert('Please login to use the background removal feature');
                return;
            }

            // Check background removal count
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(user.uid);
            
            try {
                const userDoc = await userRef.get();
                const currentDate = new Date();
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                
                if (!userDoc.exists) {
                    // First time user
                    await userRef.set({
                        bgRemovalCount: 1,
                        lastBgRemoval: currentDate,
                        firstBgRemovalOfMonth: currentDate
                    });
                } else {
                    const userData = userDoc.data();
                    const lastRemoval = userData.lastBgRemoval?.toDate();
                    
                    // Check if last removal was in a different month
                    if (!lastRemoval || lastRemoval < firstDayOfMonth) {
                        // Reset counter for new month
                        await userRef.update({
                            bgRemovalCount: 1,
                            lastBgRemoval: currentDate,
                            firstBgRemovalOfMonth: currentDate
                        });
                    } else {
                        // Check if user has reached monthly limit
                        if (userData.bgRemovalCount >= 2) {
                            alert('You have reached your monthly limit of 2 background removals. Please try again next month.');
                            return;
                        }
                        
                        // Increment counter
                        await userRef.update({
                            bgRemovalCount: firebase.firestore.FieldValue.increment(1),
                            lastBgRemoval: currentDate
                        });
                    }
                }

                // Show loading state
                this.classList.add('loading');
                const loadingSpinner = this.querySelector('.loading-spinner');
                loadingSpinner.style.display = 'block';

                try {
                    // Convert the image to a blob
                    const response = await fetch(originalImage.src);
                    const blob = await response.blob();

                    // Create form data
                    const formData = new FormData();
                    formData.append('image_file', blob);

                    // Make API request to remove.bg
                    const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
                        method: 'POST',
                        headers: {
                            'X-Api-Key': 'buB8yvEJ3EsL9iUG1C6CKJJf',
                        },
                        body: formData,
                    });

                    if (!apiResponse.ok) {
                        throw new Error('Background removal failed');
                    }

                    // Get the processed image
                    const processedBlob = await apiResponse.blob();
                    const processedUrl = URL.createObjectURL(processedBlob);

                    // Update the image preview
                    imagePreview.src = processedUrl;
                    originalImage = new Image();
                    originalImage.src = processedUrl;
                    originalImage.onload = function() {
                        originalWidth = originalImage.width;
                        originalHeight = originalImage.height;
                        aspectRatio = originalWidth / originalHeight;
                        
                        widthInput.value = originalWidth;
                        heightInput.value = originalHeight;
                        
                        displayImageInfo(processedBlob.size, originalWidth, originalHeight);
                    };

                    // Add transparent background pattern
                    previewContainer.classList.add('has-transparent-bg');
                    
                    // Show download button
                    downloadButton.style.display = 'inline-block';
                    downloadButton.href = processedUrl;
                    downloadButton.download = 'removed-bg.png';

                } catch (error) {
                    console.error('Background removal error:', error);
                    alert('Failed to remove background. Please try again.');
                } finally {
                    // Reset button state
                    this.classList.remove('loading');
                    loadingSpinner.style.display = 'none';
                }
            } catch (error) {
                console.error('Error checking background removal count:', error);
                alert('Error checking background removal count. Please try again.');
            }
        });