/**
 * DNS Checker utility
 * 
 * Tests domain resolution and availability for the API
 */

class DNSChecker {
  constructor() {
    this.domains = [
      'api.railhubpictures.org',
      'railhubpictures.org',
      'www.railhubpictures.org'
    ];
  }
  
  /**
   * Test if domains are reachable
   * @returns {Promise<Object>} Results for each domain
   */
  async checkDomains() {
    const results = {};
    
    for (const domain of this.domains) {
      try {
        console.log(`Testing domain: ${domain}`);
        const startTime = new Date().getTime();
        
        // We use no-cors mode to test if the domain exists even if it doesn't respond properly
        const response = await fetch(`https://${domain}/ping`, {
          mode: 'no-cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        
        results[domain] = {
          reachable: true,
          responseTime,
          protocol: 'https'
        };
      } catch (error) {
        console.error(`Error testing domain ${domain}:`, error);
        
        // Try HTTP as fallback
        try {
          const startTime = new Date().getTime();
          const response = await fetch(`http://${domain}/ping`, {
            mode: 'no-cors',
            cache: 'no-cache',
            timeout: 5000
          });
          
          const endTime = new Date().getTime();
          const responseTime = endTime - startTime;
          
          results[domain] = {
            reachable: true,
            responseTime,
            protocol: 'http'
          };
        } catch (httpError) {
          results[domain] = {
            reachable: false,
            error: error.message,
            httpError: httpError.message
          };
        }
      }
    }
    
    return results;
  }
}

// Make it available globally
window.dnsChecker = new DNSChecker();
