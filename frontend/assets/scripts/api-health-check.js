// api-health-check.js
// This script verifies that all API endpoints are properly accessible

async function checkEndpoint(url, description) {
    console.log(`Checking ${description} at ${url}...`);
    
    try {
        const startTime = performance.now();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${description} - SUCCESS (${duration}ms)`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
            return { success: true, duration, url, description };
        } else {
            console.error(`❌ ${description} - FAILED with status ${response.status}`);
            console.error(`   ${await response.text()}`);
            return { success: false, status: response.status, url, description };
        }
    } catch (error) {
        console.error(`❌ ${description} - ERROR: ${error.message}`);
        return { success: false, error: error.message, url, description };
    }
}

async function runHealthCheck() {
    console.log("=".repeat(50));
    console.log("RailHub Pictures API Health Check");
    console.log("=".repeat(50));
    
    const mainDomain = 'https://railhubpictures.org';
    const apiSubdomain = 'https://api.railhubpictures.org';
    const altApiSubdomain = 'https://railhub-api.railhubpictures.org';
    
    const endpoints = [
        { url: `${mainDomain}/api/photos/latest?limit=1`, description: "Main domain API" },
        { url: `${apiSubdomain}/photos/latest?limit=1`, description: "API subdomain" },
        { url: `${altApiSubdomain}/photos/latest?limit=1`, description: "Alt API subdomain" }
    ];

    // Test additional important endpoints on the primary domain
    const apiEndpoints = [
        { path: '/photos/latest?limit=5', description: "Latest photos" },
        { path: '/photos/featured?limit=1', description: "Featured photos" },
        { path: '/contributors', description: "Contributors list" },
        { path: '/health', description: "Health check" }
    ];
    
    // Add API endpoints to each domain pattern
    apiEndpoints.forEach(endpoint => {
        endpoints.push({ 
            url: `${mainDomain}/api${endpoint.path}`,
            description: `Main domain - ${endpoint.description}`
        });
        
        endpoints.push({ 
            url: `${apiSubdomain}${endpoint.path}`,
            description: `API subdomain - ${endpoint.description}`
        });
    });
    
    const results = [];
    
    // Check all endpoints
    for (const endpoint of endpoints) {
        const result = await checkEndpoint(endpoint.url, endpoint.description);
        results.push(result);
    }
    
    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("HEALTH CHECK SUMMARY");
    console.log("=".repeat(50));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Total endpoints tested: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
        console.log("\nFailed endpoints:");
        results.filter(r => !r.success).forEach(result => {
            console.log(`- ${result.description} (${result.url})`);
        });
        
        console.log("\nPossible issues to check:");
        console.log("1. Cloudflare Worker is deployed correctly");
        console.log("2. Route patterns in wrangler.toml are correct");
        console.log("3. DNS records are properly configured");
        console.log("4. CORS headers are properly set");
    }
    
    console.log("\nDone!");
}

runHealthCheck().catch(console.error);
