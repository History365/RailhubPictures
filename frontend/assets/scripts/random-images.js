// Image collection for the website
const images = [
    {src: "assets/images/IMG_8337.jpg", link: "showpictureid=1.html"},
    {src: "assets/images/dji_fly_20240610.jpg", link: "showpictureid=2.html"},
    {src: "assets/images/MG_3203.jpg", link: "showpictureid=3.html"},
    {src: "assets/images/DSC00948.jpg", link: "showpictureid=4.html"},
    {src: "assets/images/DSC_1708.jpg", link: "showpictureid=5.html"},
    {src: "assets/images/DSC_2014.jpg", link: "showpictureid=6.html"},
    {src: "assets/images/DSC_2073.jpg", link: "showpictureid=7.html"},
    {src: "assets/images/DSC_1560.jpg", link: "showpictureid=8.html"},
    {src: "assets/images/DSC_2572.jpg", link: "showpictureid=9.html"},
    {src: "assets/images/DSC_4139.jpg", link: "showpictureid=10.html"},
    {src: "assets/images/MG_3312.jpg", link: "showpictureid=11.html"},
    {src: "assets/images/DSC_3856.jpg", link: "showpictureid=12.html"},
    {src: "assets/images/DSC_2565.jpg", link: "showpictureid=13.html"},
    {src: "assets/images/MG_3182.jpg", link: "showpictureid=14.html"},
    {src: "assets/images/MG_3173.jpg", link: "showpictureid=15.html"},
    {src: "assets/images/MG_3316.jpg", link: "showpictureid=16.html"},
    {src: "assets/images/MG_3256.jpg", link: "showpictureid=17.html"},
    {src: "assets/images/DSC_4027.jpg", link: "showpictureid=18.html"},
    {src: "assets/images/DSC_4337.jpg", link: "showpictureid=19.html"},
    {src: "assets/images/P1010715.jpg", link: "showpictureid=20.html"},
    {src: "assets/images/MG_3220.jpg", link: "showpictureid=21.html"},
    {src: "assets/images/IMG_1908.jpg", link: "showpictureid=22.html"},
    {src: "assets/images/IMG_3526.jpg", link: "showpictureid=25.html"},
    {src: "assets/images/IMG_3695.jpg", link: "showpictureid=26.html"},
    {src: "assets/images/IMG_4046.jpg", link: "showpictureid=27.html"},
    {src: "assets/images/IMG_8871.jpg", link: "showpictureid=29.html"},
    {src: "assets/images/IMG_8879.jpg", link: "showpictureid=30.html"},
    {src: "assets/images/MG_1848.jpg", link: "showpictureid=31.html"},
    {src: "assets/images/MG_1865.jpg", link: "showpictureid=32.html"},
    {src: "assets/images/MG_1886.jpg", link: "showpictureid=33.html"},
    {src: "assets/images/MG_1956.jpg", link: "showpictureid=34.html"},
    {src: "assets/images/MG_2066.jpg", link: "showpictureid=35.html"},
    {src: "assets/images/MG_2179.jpg", link: "showpictureid=36.html"},
    {src: "assets/images/MG_3215.jpg", link: "showpictureid=37.html"},
    {src: "assets/images/MG_3280.jpg", link: "showpictureid=38.html"},
    {src: "assets/images/P1000313.jpg", link: "showpictureid=39.html"},
    {src: "assets/images/dji_fly_20240331.jpg", link: "showpictureid=40.html"},
    {src: "assets/images/dji_fly_20240428.jpg", link: "showpictureid=41.html"},
    {src: "assets/images/dji_fly_20240502.jpg", link: "showpictureid=42.html"},
    {src: "assets/images/MG_3435.jpg", link: "showpictureid=23.html"},
    {src: "assets/images/MG_3452.jpg", link: "showpictureid=24.html"},
    {src: "assets/images/DSC_0260.jpg", link: "showpictureid=55.html"},
    {src: "assets/images/DSC_0191.jpg", link: "showpictureid=54.html"},
    {src: "assets/images/DSC_0018.jpg", link: "showpictureid=53.html"},
    {src: "assets/images/CSC_0371.jpg", link: "showpictureid=52.html"},
    {src: "assets/images/DSC_0601.jpg", link: "showpictureid=51.html"},
    {src: "assets/images/DSC_0431.jpg", link: "showpictureid=50.html"},
    {src: "assets/images/DSC_0286.jpg", link: "showpictureid=49.html"},
    {src: "assets/images/CSC_0302.jpg", link: "showpictureid=48.html"},
    {src: "assets/images/472070735_1580262769264924_2326834061653819060_n.jpg", link: "showpictureid=56.html"},
    {src: "assets/images/DSC_0386.jpg", link: "showpictureid=57.html"},
    {src: "assets/images/DSC_0744.jpg", link: "showpictureid=58.html"},
    {src: "assets/images/DSC_1033.jpg", link: "showpictureid=59.html"},
    {src: "assets/images/DSC_0434.jpg", link: "showpictureid=60.html"},
    {src: "assets/images/DSC_0534.jpg", link: "showpictureid=61.html"},
    {src: "assets/images/CSC_0693.jpg", link: "showpictureid=62.html"},
    {src: "assets/images/CSC_0694.jpg", link: "showpictureid=63.html"}];

// Site statistics data
const siteStatistics = {
    totalPhotos: images.length,
    totalContributors: 23,
    locomotiveModels: 143,
    railroads: 6
};

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

function displayRandomImage() {
    const randomImage = getRandomImage();
    const container = document.createElement('div');
    
    const link = document.createElement('a');
    link.href = randomImage.link;
    
    const img = document.createElement('img');
    img.style.cssText = 'max-width: 100%; max-height: 600px; object-fit: contain; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
    img.alt = 'Featured Railroad Photo';
    img.src = randomImage.src;
    img.loading = 'eager';
    img.decoding = 'sync';
    img.fetchPriority = 'high';
    
    link.appendChild(img);
    container.appendChild(link);
    
    const scriptElement = document.currentScript;
    if (scriptElement && scriptElement.parentElement) {
        scriptElement.parentElement.appendChild(container);
    }
}

function loadRandomImages(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const availableImages = [...images]; // Make a copy of the images array
    const selectedImages = [];

    // Select random images without repetition
    while (selectedImages.length < count && availableImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const image = availableImages.splice(randomIndex, 1)[0]; // Remove and get the selected image
        selectedImages.push(image);
        
        // Create image element with link
        const link = document.createElement('a');
        link.href = image.link;
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = 'Railroad Photo';
        img.loading = 'lazy';
        
        link.appendChild(img);
        container.appendChild(link);
    }
}

// Fill the home page statistics section
function fillStatisticsSection() {
    const statsElements = {
        'total-photos': siteStatistics.totalPhotos,
        'total-contributors': siteStatistics.totalContributors,
        'total-models': siteStatistics.locomotiveModels,
        'total-railroads': siteStatistics.railroads
    };
    
    // Update each statistic element with its value
    Object.keys(statsElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = statsElements[id].toLocaleString();
        }
    });
}

// Fill random images grid for homepage
function fillRandomImagesGrid() {
    const container = document.getElementById('random-images-grid');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Get 3 random images for the featured grid
    const availableImages = [...images];
    const selectedImages = [];
    
    // Select random images without repetition
    while (selectedImages.length < 3 && availableImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const image = availableImages.splice(randomIndex, 1)[0];
        selectedImages.push(image);
        
        // Create image element with link
        const imageDiv = document.createElement('div');
        imageDiv.className = 'featured-image';
        
        const link = document.createElement('a');
        link.href = image.link;
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = 'Featured Railroad Photo';
        img.loading = 'lazy';
        
        // Add caption
        const caption = document.createElement('div');
        caption.className = 'image-caption';
        caption.textContent = 'View Photo Details';
        
        link.appendChild(img);
        link.appendChild(caption);
        imageDiv.appendChild(link);
        container.appendChild(imageDiv);
    }
}

// Initialize statistics and random images on page load
document.addEventListener('DOMContentLoaded', function() {
    fillStatisticsSection();
    fillRandomImagesGrid();
});

// Export functions for use with ES modules
export { getRandomImage, displayRandomImage, loadRandomImages, fillStatisticsSection, fillRandomImagesGrid, siteStatistics };