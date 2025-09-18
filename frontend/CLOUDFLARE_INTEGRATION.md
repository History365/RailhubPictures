# Cloudflare Integration for RailHub Pictures

This document explains how to integrate Cloudflare database and storage with your existing frontend.

## Required Script Additions

To enable Cloudflare integration on all pages, add these scripts to the `<head>` section of each HTML file:

```html
<script src="assets/scripts/cloudflare/api-client.js"></script>
<script src="assets/scripts/cloudflare/clerk-integration.js"></script>
<script src="assets/scripts/cloudflare/photo-display.js"></script>
<script src="assets/scripts/cloudflare/cloudflare-integration.js"></script>
```

### Specific Page Scripts

- For search pages, also add:
  ```html
  <script src="assets/scripts/cloudflare/search-handler.js"></script>
  ```

- For upload pages, also add:
  ```html
  <script src="assets/scripts/cloudflare/upload-handler.js"></script>
  ```

## Alternative: Global Integration

If you prefer not to modify each HTML file individually, add this single script to all pages:

```html
<script src="assets/scripts/cloudflare-loader.js"></script>
```

This script will automatically load all the necessary Cloudflare integration scripts.

## HTML Structure Requirements

For the Cloudflare integration to work properly, your HTML pages should follow these structural guidelines:

### Photo Display Pages

Photo containers should have class names like `photo-grid` or `photos-container`:

```html
<div class="photo-grid">
  <!-- Photos will be displayed here -->
</div>
```

### Single Photo Pages

Single photo pages should have a container with class `photo-detail`:

```html
<div class="photo-detail">
  <!-- Photo details will be displayed here -->
</div>
```

### Search Pages

Search pages should have a form with class `search-form` and a results container with class `search-results`:

```html
<form class="search-form">
  <!-- Search fields -->
</form>

<div class="search-results">
  <!-- Search results will be displayed here -->
</div>
```

### Upload Pages

Upload pages should have a form with ID `upload-form`:

```html
<form id="upload-form">
  <!-- Upload fields -->
</form>
```

### User Profile Pages

User profile pages should have a container with class `profile-photos`:

```html
<div class="profile-photos">
  <!-- User's photos will be displayed here -->
</div>
```

## Testing the Integration

After adding the scripts and setting up Cloudflare as described in the CLOUDFLARE_SETUP_GUIDE.md, you should:

1. Open your site in a browser
2. Check the browser console for any errors
3. Verify that photos are loading from Cloudflare R2
4. Test the upload functionality
5. Test the search functionality
6. Verify user authentication is working

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify your Clerk authentication is configured correctly
3. Confirm Cloudflare Worker is deployed and running
4. Verify that database schema has been applied to D1
5. Check R2 bucket permissions

For more detailed setup instructions, refer to CLOUDFLARE_SETUP_GUIDE.md.
