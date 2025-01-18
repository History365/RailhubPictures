const images = [
    {src: "images/IMG_8337.jpg", link: "showpictureid=1.html"},
    {src: "images/dji_fly_20240610.jpg", link: "showpictureid=2.html"},
    {src: "images/MG_3203.jpg", link: "showpictureid=3.html"},
    {src: "images/DSC00948.jpg", link: "showpictureid=4.html"},
    {src: "images/DSC_1708.JPG", link: "showpictureid=5.html"},
    {src: "images/DSC_2014.JPG", link: "showpictureid=6.html"},
    {src: "images/DSC_2073.JPG", link: "showpictureid=7.html"},
    {src: "images/DSC_1560.JPG", link: "showpictureid=8.html"},
    {src: "images/DSC_2572.JPG", link: "showpictureid=9.html"},
    {src: "images/DSC_4139.JPG", link: "showpictureid=10.html"},
    {src: "images/MG_3312.jpg", link: "showpictureid=11.html"},
    {src: "images/DSC_3856.JPG", link: "showpictureid=12.html"},
    {src: "images/DSC_2565.JPG", link: "showpictureid=13.html"},
    {src: "images/MG_3182.jpg", link: "showpictureid=14.html"},
    {src: "images/MG_3173.jpg", link: "showpictureid=15.html"},
    {src: "images/MG_3316.jpg", link: "showpictureid=16.html"},
    {src: "images/MG_3256.jpg", link: "showpictureid=17.html"},
    {src: "images/DSC_4027.JPG", link: "showpictureid=18.html"},
    {src: "images/DSC_4337.JPG", link: "showpictureid=19.html"},
    {src: "images/P1010715.JPG", link: "showpictureid=20.html"},
    {src: "images/MG_3220.jpg", link: "showpictureid=21.html"},
    {src: "images/IMG_1908.jpg", link: "showpictureid=22.html"},
    {src: "images/IMG_3526.jpg", link: "showpictureid=25.html"},
    {src: "images/IMG_3695.jpg", link: "showpictureid=26.html"},
    {src: "images/IMG_4046.jpg", link: "showpictureid=27.html"},
    {src: "images/IMG_8871.jpg", link: "showpictureid=29.html"},
    {src: "images/IMG_8879.jpg", link: "showpictureid=30.html"},
    {src: "images/MG_1848.jpg", link: "showpictureid=31.html"},
    {src: "images/MG_1865.jpg", link: "showpictureid=32.html"},
    {src: "images/MG_1886.jpg", link: "showpictureid=33.html"},
    {src: "images/MG_1956.jpg", link: "showpictureid=34.html"},
    {src: "images/MG_2066.jpg", link: "showpictureid=35.html"},
    {src: "images/MG_2179.jpg", link: "showpictureid=36.html"},
    {src: "images/MG_3215.jpg", link: "showpictureid=37.html"},
    {src: "images/MG_3280.jpg", link: "showpictureid=38.html"},
    {src: "images/P1000313.JPG", link: "showpictureid=39.html"},
    {src: "images/dji_fly_20240331.jpg", link: "showpictureid=40.html"},
    {src: "images/dji_fly_20240428.jpg", link: "showpictureid=41.html"},
    {src: "images/dji_fly_20240502.jpg", link: "showpictureid=42.html"},
    {src: "images/MG_3435.jpg", link: "showpictureid=23.html"},
    {src: "images/MG_3452.jpg", link: "showpictureid=24.html"},
    {src: "images/DSC_0260.JPG", link: "showpictureid=55.html"},
    {src: "images/DSC_0191.JPG", link: "showpictureid=54.html"},
    {src: "images/DSC_0018.JPG", link: "showpictureid=53.html"},
    {src: "images/CSC_0371.JPG", link: "showpictureid=52.html"},
    {src: "images/DSC_0601.JPG", link: "showpictureid=51.html"},
    {src: "images/DSC_0431.JPG", link: "showpictureid=50.html"},
    {src: "images/DSC_0286.JPG", link: "showpictureid=49.html"},
    {src: "images/CSC_0302.JPG", link: "showpictureid=48.html"}
];

function getRandomImage() {
    const STORAGE_KEY = 'usedImages';
    let usedImages = [];
    
    try {
        usedImages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
        console.error('Error parsing used images:', error);
        localStorage.setItem(STORAGE_KEY, '[]');
    }

    if (usedImages.length >= images.length) {
        usedImages = [];
    }

    const availableImages = images.filter(img => !usedImages.includes(img.src));
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const selectedImage = availableImages[randomIndex];

    try {
        usedImages.push(selectedImage.src);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usedImages));
    } catch (error) {
        console.error('Error saving used images:', error);
    }

    return selectedImage;
}

function displayRandomImage() {
    const randomImage = getRandomImage();
    const container = document.createElement('div');
    
    const link = document.createElement('a');
    link.href = randomImage.link;
    link.target = '_blank';
    
    const img = document.createElement('img');
    img.style.cssText = 'float: right; border: solid 1px #000; width: 315px; height: auto; margin: 0 0 1rem 1rem;';
    img.alt = 'Front Page Pic';
    img.src = randomImage.src;
    img.loading = 'eager';
    img.decoding = 'sync';
    img.fetchPriority = 'high';
    
    link.appendChild(img);
    container.appendChild(link);
    
    const targetElement = document.currentScript?.parentElement || document.body;
    targetElement.appendChild(container);
}