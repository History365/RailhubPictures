document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const railroad = document.getElementById('railroad').value;
    const model = document.getElementById('model').value;
    const operatingNumber = document.getElementById('operatingNumber').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const photo = document.getElementById('photo').files[0];

    // Get the next ID number
    let nextId = 1;
    if(localStorage.getItem('lastLocoId')) {
        nextId = parseInt(localStorage.getItem('lastLocoId')) + 1;
    }
    localStorage.setItem('lastLocoId', nextId);

    // Create new HTML file content
    const htmlContent = `<!DOCTYPE html>
<html>
<head id="ctl00_Head1">
    <link rel="stylesheet" href="stylesheet/stylesheet.css" type="text/css">
    <title>Pictures of ${railroad} ${operatingNumber}</title>
    <meta id="ctl00_metaDescription" name="description" content="Pictures of ${railroad} ${model} ${operatingNumber}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="Scripts/header-nav.js"></script>
    <script src="Scripts/random-images.js"></script>
    <script src="Scripts/user-auth.js"></script>
    <script src="Scripts/member-login.js"></script>
</head>
<body>
    <!-- Rest of the template HTML -->
    <div class="main-content">
        <div class="breadcrumbs">
            <a href="index.html">Home</a> > 
            <a href="Railroadid=${railroad}.html">${railroad}</a> > 
            <a href="modelListRRid=${railroad}.html">Locomotives</a> > 
            <a href="modelListid=${model}.html">${model}</a> > ${operatingNumber}
        </div>
        <div class="content-header">
            <h1 class="PageHeader">Pictures of ${railroad} ${operatingNumber}</h1>
            <div class="locomotive-details">
                <table width="500" class="CallOutSmall">
                    <tr>
                        <td align="right"><strong>Owner:</strong></td>
                        <td colspan="3">${railroad}</td>
                    </tr>
                    <tr>
                        <td align="right">Model:</td>
                        <td class="DefText">${model}</td>
                    </tr>
                    <tr>
                        <td align="right">Location:</td>
                        <td class="DefText">${city}, ${state}</td>
                    </tr>
                </table>
            </div>
        </div>
        <hr>
        <table cellspacing="0" cellpadding="6" style="border:2px solid #8F8F8F" align="center" width="100%" bgcolor="#E6E6E6">
            <tr>
                <td align="left" width="150" nowrap="nowrap" style="border-right:solid black 1px">
                    <img src="${URL.createObjectURL(photo)}" border="0" alt="${title}" style="width: 225px; height: auto;">
                </td>
                <td align="left" valign="top" style="padding: .5rem;">
                    <table class="DefText" style="width: 100%;">
                        <tr>
                            <td align="right" width="100"><strong>Title:</strong></td>
                            <td>${title}</td>
                        </tr>
                        <tr>
                            <td align="right" valign="top"><strong>Description:</strong></td>
                            <td class="SmallText">${description}</td>
                        </tr>
                        <tr>
                            <td align="right"><strong>Photo Date:</strong></td>
                            <td>${new Date().toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td align="right"><strong>Location:</strong></td>
                            <td>${city}, ${state}</td>
                        </tr>
                        <tr>
                            <td align="right"><strong>Author:</strong></td>
                            <td>${localStorage.getItem('username')}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
    <footer style="border-top: 1px solid #eee; padding: 1rem; margin-top: 0rem;">
        <div class="DefText" style="display: flex; justify-content: space-between;">
            <div>Railhub Pictures © 2024-2025 Photos © respective authors</div>
            <div>Version 1.0</div>
        </div>
    </footer>
</body>
</html>`;

    // Create file using File System Access API
    const fileName = `locopictureid=${nextId}.html`;
    const opts = {
        suggestedName: fileName,
        types: [{
            description: 'HTML Files',
            accept: {'text/html': ['.html']},
        }],
    };

    async function saveFile() {
        try {
            const handle = await window.showSaveFilePicker(opts);
            const writable = await handle.createWritable();
            await writable.write(htmlContent);
            await writable.close();
        } catch (err) {
            console.error('Failed to save file:', err);
            // Fallback to the old method if File System Access API is not supported
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    }

    saveFile();
});