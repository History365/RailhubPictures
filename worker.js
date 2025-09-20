/**
 * Cloudflare Worker API for RailHub Pictures
 * Handles API requests and connects to D1 database
 * Also handles dynamic locomotive page generation
 */

import { CloudflareD1Client } from './db-client';
import { generateMigrationSQL } from './schema/migration';
import ClerkAuth from './clerk-auth';

// Our custom template with CSS and JS for the locomotive page
const locoTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= unit.railroad %> <%= unit.number %> (<%= unit.model %>) | Railhub Pictures</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="assets/stylesheet/theme.css" rel="stylesheet">
    <link href="assets/stylesheet/styles.css" rel="stylesheet">
    <link href="assets/stylesheet/homepage.css" rel="stylesheet">
    <link href="assets/stylesheet/homepage2.css" rel="stylesheet">
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    <script src="assets/scripts/api-loader.js"></script>
    <script src="assets/scripts/cloudflare/clerk-integration.js"></script>
    <script src="assets/scripts/cloudflare/photo-display.js"></script>
    <script src="assets/scripts/cloudflare/cloudflare-integration.js"></script>
    <script src="assets/scripts/footer.js" defer></script>
    <script
      async
      crossorigin="anonymous"
      data-clerk-publishable-key="pk_test_Y29tbXVuYWwtY2F0LTI1LmNsZXJrLmFjY291bnRzLmRldiQ"
      src="https://communal-cat-25.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      type="text/javascript">
    </script>
    <script src="assets/scripts/clerk-auth.js"></script>
    <style>
    </style>
</head>
<body>
    <header style="padding: 1rem 0; background: #fff; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; font-family: 'Inter', Helvetica, Arial, sans-serif; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-bottom: 1px solid #eee;">
        <div style="display: flex; flex-direction: column; max-width: 1400px; margin: 0 auto; padding: 0 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <a href="index.html" style="display: flex; align-items: center;">
                    <img src="images/logo.jpg" alt="Logo" style="max-width: 300px; height: auto;">
                </a>
                <div style="display: flex; align-items: center; gap: 2rem;">
                    <span style="color: #666; font-size: 0.95em;" id="userInfo"></span>
                    <script>
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, '0');
                        var mm = String(today.getMonth() + 1).padStart(2, '0');
                        var yyyy = today.getFullYear();
                        document.write('<span style="color: #666;">' + mm + '/' + dd + '/' + yyyy + '</span>');
                    </script>
                    <div style="display: flex; gap: 1rem;">
                        <a href="login.html" style="color: #444; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #f5f5f5; transition: all 0.2s; font-size: 0.95em; border: 1px solid #eee;">Log In</a>
                        <a href="register.html" style="color: #fff; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #444; transition: all 0.2s; font-size: 0.95em;">Register</a>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <nav style="display: flex; gap: 2.5rem;">
                    <a href="index.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Home</a>
                    <a href="newestphotos.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Latest Photos</a>
                    <a href="contribPicks.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Contributor Picks</a>
                    <a href="railroadList.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Railroads</a>
                </nav>
                <div style="display: flex; gap: 1.5rem; align-items: center; margin-left: 4rem;">
                    <form action="search.html" method="get" style="display: flex; gap: 0.5rem;">
                        <input type="text" name="q" placeholder="Search..." style="padding: 0.7em 1em; border: 1px solid #eee; border-radius: 6px; font-size: 0.95em; width: 240px; background: #f5f5f5; color: #444; font-family: 'Inter', sans-serif;">
                        <button type="submit" style="background: #444; color: #fff; border: none; padding: 0.7em 1.2em; border-radius: 6px; font-size: 0.95em; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 500; transition: all 0.2s;">Search</button>
                    </form>
                    <a href="upload.html" style="color: #fff; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s; background: #444; padding: 0.7em 1.4em; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.5rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="content">
            <div style="margin-bottom: 1rem;">
                <div class="breadcrumb" style="justify-content: flex-start; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid #eee;">
                    <a href="/">Home</a>
                    <span>›</span>
                    <a href="/railroad/<%= unit.railroad %>"><%= formatRailroadName(unit.railroad) %></a>
                    <span>›</span>
                    <a href="/railroad/<%= unit.railroad %>/models">Locomotive Models</a>
                    <span>›</span>
                    <a href="/railroad/<%= unit.railroad %>/<%= unit.model %>"><%= formatModelName(unit.model) %></a>
                    <span>›</span>
                    <span><%= unit.railroad %> <%= unit.number %></span>
                </div>

                <h1 style="text-align: left; margin: 0.5rem 0;">
                    <%= unit.railroad %> <%= unit.number %> (<%= formatModelName(unit.model) %>)
                </h1>
            </div>
            <div class="locomotive-info" style="max-width: 100%;">
                <div style="font-size: 0.85rem;">
                <div style="margin-bottom: 0.5rem;">
                    <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Locomotive<%= units.length > 1 ? 's' : '' %>:</span>
                    <span style="margin-left: 0.5rem;">
                        <% units.forEach(function(unitInPhoto, index) { %>
                            <span style="color: #333;">
                                <%= unitInPhoto.railroad %> <%= unitInPhoto.number %> (<%= formatModelName(unitInPhoto.model) %>)
                            </span>
                            <% if (index < units.length - 1) { %><span style="margin: 0 0.5rem;">•</span><% } %>
                        <% }); %>
                    </span>
                </div>

                <div style="display: flex; margin-bottom: 0.5rem;">
                    <div style="width: 300px;">
                        <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Owner:</span>
                        <span style="margin-left: 0.5rem;"><a href="locoListid=<%= unit.railroad %>.html" style="text-decoration: underline; color: #333; font-weight: 600;"><%= formatRailroadName(unit.railroad) %></a></span>
                    </div>
                    <div style="margin-left: 2rem;">
                        <span style="display: inline-block; width: 80px; text-align: right; font-weight: 600; color: #555;">Model:</span>
                        <span style="margin-left: 0.5rem;"><%= formatModelName(unit.model) %></span>
                    </div>
                </div>
                <div class="technical-info">
                    <% if (units.length > 0) { %>
                        <div>
                        </div>

                            <div style="display: flex; margin-bottom: 0.5rem;">
                                <div style="width: 300px;">
                                    <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Serial Number:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.serial_number) { %>
                                            <a href="/search?serial=<%= unit.serial_number %>" style="text-decoration: underline; color: #333; font-weight: 600;"><%= unit.serial_number %></a>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                                <div style="margin-left: 2rem;">
                                    <span style="display: inline-block; width: 80px; text-align: right; font-weight: 600; color: #555;">Order No:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.order_number) { %>
                                            <a href="/search?order=<%= unit.order_number %>" style="text-decoration: underline; color: #333; font-weight: 600;"><%= unit.order_number %></a>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                            </div>

                            <div style="display: flex; margin-bottom: 0.5rem;">
                                <div style="width: 300px;">
                                    <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Frame Number:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.frame_number) { %>
                                            <%= unit.frame_number %>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                                <div style="margin-left: 2rem;">
                                    <span style="display: inline-block; width: 80px; text-align: right; font-weight: 600; color: #555;">Built:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.built_date) { %>
                                            <%= unit.built_date %>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                            </div>

                            <div style="margin-bottom: 0.5rem;">
                                <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Notes:</span>
                                <span style="margin-left: 0.5rem;">
                                    <% if (unit.notes) { %>
                                        <%= unit.notes %>
                                    <% } else { %>
                                        <span style="color: #777;">-</span>
                                    <% } %>
                                </span>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; text-align: left; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;"></h2>
            
            <div class="photo-grid" style="gap: 0.5rem;">
                <% 
                const query = locals.query || {};
                const itemsPerPage = 50;
                const currentPage = parseInt(query.page || 1);
                const totalPages = Math.ceil(photos.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedPhotos = [...photos].reverse().slice(startIndex, startIndex + itemsPerPage);
                %>
                <% paginatedPhotos.forEach(function(photo) { %>
                <div class="photo-card" style="margin-bottom: 0.25rem;">
                    <a href="/showpictureid=<%= photo.id %>">
                        <img src="/uploads/<%= photo.filename %>" alt="<%= unit.railroad %> <%= unit.number %> at <%= photo.location %>" class="photo-image">
                    </a>
                    <div class="photo-details" style="font-size: 0.9rem; padding: 0.5rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;"><%= photo.title %></h3>
                        <p style="font-size: 0.8rem; color: #666; margin-bottom: 0.25rem; padding-bottom: 0.25rem; border-bottom: 1px solid #eee;"><%= photo.description %></p>
                        
                        <div class="photo-meta">
                            <div>
                                <p style="margin-bottom: 0.25rem;">
                                    <span style="font-weight: 600; color: #555;">Location:</span>
                                    <span style="margin-left: 0.25rem;"><a href="/search?location=<%= encodeURIComponent(photo.location) %>" style="text-decoration: none; color: #333;"><%= photo.location %></a></span>
                                    <span style="margin: 0 0.6rem;"></span>
                                    <span style="font-weight: 600; color: #555;"> Stats:</span>
                                    <span style="margin-left: 0.25rem;"><%= photo.view_count || 0 %> views  <%= photo.comment_count || 0 %> comments</span>
                                </p>
                                
                                <p style="margin-bottom: 0.5rem;">
                                    <span style="font-weight: 600; color: #555;">Author:</span>
                                    <span style="margin-left: 0.25rem;"><a href="/user/<%= photo.user_id %>" style="text-decoration: none; color: #333;"><%= photo.display_name %></a></span>
                                </p>
                                
                                <p style="margin-bottom: 0.5rem;">
                                    <span style="font-weight: 600; color: #555;">Photo Date:</span>
                                    <span style="margin-left: 0.25rem;"><%= new Date(photo.photo_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) %></span>
                                    <span style="margin: 0 0.5rem;">•</span>
                                    <span style="font-weight: 600; color: #555;">Upload Date:</span>
                                    <span style="margin-left: 0.25rem;"><%= new Date(photo.uploaded_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) %> <%= new Date(photo.uploaded_at).toLocaleTimeString('en-US') %></span>
                                </p>
                                
                                <p style="margin-bottom: 0;">
                                    <span style="font-weight: 600; color: #555;">Locomotives:</span>
                                    <span style="margin-left: 0.25rem;">
                                        <% if (photo.units && photo.units.length > 0) { %>
                                            <% photo.units.forEach(function(unitInPhoto, index) { %>
                                                <a href="/showpictureid=<%= photo.id %>" title="View <%= unitInPhoto.railroad %> <%= unitInPhoto.number %>" style="text-decoration: underline; color: #333; font-weight: 600;">
                                                    <%= unitInPhoto.railroad %> <%= unitInPhoto.number %> (<%= formatModelName(unitInPhoto.model) %>)
                                                </a>
                                                <% if (index < photo.units.length - 1) { %> • <% } %>
                                            <% }); %>
                                        <% } else { %>
                                            Unknown
                                        <% } %>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <% }); %>
            </div>
            
            <% if (photos.length > itemsPerPage) { %>
            <div style="display: flex; justify-content: center; align-items: center; padding: 1rem 0; border-top: 1px solid #eee; margin: 1rem 0;">
                <div style="text-align: center; font-size: 0.9rem; color: #666; display: flex; gap: 0.5rem; align-items: center;">
                    <% if (currentPage > 1) { %>
                        <a href="?page=<%= currentPage - 1 %>" style="color: #444; text-decoration: none; padding: 0.3em 0.6em; border: 1px solid #ddd; border-radius: 4px;">Previous</a>
                    <% } %>
                    <span>Page <%= currentPage %> of <%= totalPages %></span>
                    <% if (currentPage < totalPages) { %>
                        <a href="?page=<%= currentPage + 1 %>" style="color: #444; text-decoration: none; padding: 0.3em 0.6em; border: 1px solid #ddd; border-radius: 4px;">Next</a>
                    <% } %>
                </div>
            </div>
            <% } else { %>
            <div style="display: flex; justify-content: center; align-items: center; padding: 0.5rem 0; border-top: 1px solid #eee; margin: 1rem 0;">
                <div style="text-align: center; font-size: 0.9rem; color: #666;">
                    Page 1 of 1
                </div>
            </div>
            <% } %>
        </div>
    </main>

    <footer style="background: white; border-top: 1px solid #eee; padding: 1.5rem 0; margin-top: auto;">
        <div style="width: 100%; padding: 0 2rem; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <div>Railhub Pictures © 2024-2025 Photos © respective authors</div>
            <div>Version 1.0</div>
        </div>
    </footer>
</body></html>`;

// These helper functions are now built into the template
// We keep them here as fallbacks in case the template's functions fail
function formatRailroadName(railroad) {
  const suffixes = {
    'BNSF': 'Railway',
    'CSX': 'Transportation',
    'NS': 'Railway',
    'UP': 'Railroad',
    'CN': 'Railway',
    'CP': 'Railway',
    'KCS': 'Railway'
  };
  return suffixes[railroad] ? railroad + ' ' + suffixes[railroad] : railroad;
}

function formatModelName(model) {
  if (!model) return 'Unknown';
  
  if (model.startsWith && (
      model.startsWith('SD') || model.startsWith('GP') || model.startsWith('MP') || 
      model.startsWith('F') || model.startsWith('SW') || model.startsWith('NW'))) {
    return 'EMD ' + model;
  }
  if (model.startsWith && (
      model.startsWith('ES') || model.startsWith('ET') || model.startsWith('AC') || 
      model.startsWith('B') || model.startsWith('C') || model.startsWith('U'))) {
    return 'GE ' + model;
  }
  return model;
}

// Custom template rendering function
function processTemplate(template, data) {
  let result = template;
  
  // Remove EJS internal function definitions to avoid conflicts
  result = result.replace(/<%\s*function formatRailroadName[\s\S]*?}\s*%>/g, '');
  result = result.replace(/<%\s*function formatModelName[\s\S]*?}\s*%>/g, '');
  
  // Replace basic <%= %> expressions
  result = result.replace(/<%=\s*(.*?)\s*%>/g, (match, p1) => {
    try {
      // Handle common expressions
      if (p1.includes('formatRailroadName')) {
        const railroadMatch = p1.match(/formatRailroadName\((.*?)\)/);
        if (railroadMatch) {
          const railroadKey = railroadMatch[1].trim();
          const railroad = evalInContext(railroadKey, data);
          return formatRailroadName(railroad);
        }
      }
      
      if (p1.includes('formatModelName')) {
        const modelMatch = p1.match(/formatModelName\((.*?)\)/);
        if (modelMatch) {
          const modelKey = modelMatch[1].trim();
          const model = evalInContext(modelKey, data);
          return formatModelName(model);
        }
      }
      
      if (p1.includes('new Date')) {
        if (p1.includes('toLocaleDateString')) {
          return new Date().toLocaleDateString('en-US');
        }
        if (p1.includes('toLocaleTimeString')) {
          return new Date().toLocaleTimeString('en-US');
        }
        return new Date().getFullYear();
      }
      
      if (p1.includes('encodeURIComponent')) {
        const encodeMatch = p1.match(/encodeURIComponent\((.*?)\)/);
        if (encodeMatch) {
          const valueKey = encodeMatch[1].trim();
          const value = evalInContext(valueKey, data);
          return encodeURIComponent(value || '');
        }
      }
      
      return evalInContext(p1, data) || '';
    } catch (error) {
      console.error('Error processing template expression:', p1, error);
      return '';
    }
  });
  
  // Replace <% if %> blocks
  result = handleConditionals(result, data);
  
  // Replace <% forEach %> blocks
  result = handleLoops(result, data);
  
  return result;
}

// Helper to evaluate expressions in context
function evalInContext(expr, context) {
  try {
    // Handle nested properties (unit.railroad)
    if (expr.includes('.')) {
      const parts = expr.split('.');
      let value = context;
      for (const part of parts) {
        value = value[part];
      }
      return value || '';
    }
    
    // Direct property access
    return context[expr] || '';
  } catch (e) {
    console.error('Error evaluating:', expr, e);
    return '';
  }
}

// Handle if/else conditionals
function handleConditionals(template, data) {
  // This is a simplified implementation - for complex templates, you'd need more robust parsing
  const ifPattern = /<%\s*if\s*\((.*?)\)\s*{\s*%>([\s\S]*?)<%\s*}\s*else\s*{\s*%>([\s\S]*?)<%\s*}\s*%>/g;
  const simpleIfPattern = /<%\s*if\s*\((.*?)\)\s*{\s*%>([\s\S]*?)<%\s*}\s*%>/g;
  
  // Handle if/else blocks
  let result = template.replace(ifPattern, (match, condition, ifBlock, elseBlock) => {
    try {
      // Check for common conditions
      let conditionMet = false;
      
      if (condition.includes('&&')) {
        // Handle AND conditions
        const parts = condition.split('&&');
        conditionMet = parts.every(part => evaluateCondition(part.trim(), data));
      } else if (condition.includes('||')) {
        // Handle OR conditions
        const parts = condition.split('||');
        conditionMet = parts.some(part => evaluateCondition(part.trim(), data));
      } else {
        conditionMet = evaluateCondition(condition, data);
      }
      
      return conditionMet ? ifBlock : elseBlock;
    } catch (e) {
      console.error('Error in conditional:', condition, e);
      return '';
    }
  });
  
  // Handle simple if blocks (no else)
  result = result.replace(simpleIfPattern, (match, condition, ifBlock) => {
    try {
      return evaluateCondition(condition, data) ? ifBlock : '';
    } catch (e) {
      console.error('Error in simple conditional:', condition, e);
      return '';
    }
  });
  
  return result;
}

// Evaluate a condition
function evaluateCondition(condition, data) {
  condition = condition.trim();
  
  // Common patterns
  if (condition.includes(' > ')) {
    const [left, right] = condition.split(' > ').map(s => s.trim());
    return evalInContext(left, data) > parseFloat(right);
  }
  
  if (condition.includes(' < ')) {
    const [left, right] = condition.split(' < ').map(s => s.trim());
    return evalInContext(left, data) < parseFloat(right);
  }
  
  if (condition.includes(' === ')) {
    const [left, right] = condition.split(' === ').map(s => s.trim());
    return evalInContext(left, data) === right.replace(/['"]/g, '');
  }
  
  if (condition.includes(' == ')) {
    const [left, right] = condition.split(' == ').map(s => s.trim());
    return evalInContext(left, data) == right.replace(/['"]/g, '');
  }
  
  // Check for existence
  if (condition.includes('.length')) {
    const array = evalInContext(condition.split('.')[0], data);
    return array && array.length > 0;
  }
  
  // Direct check
  return !!evalInContext(condition, data);
}

// Handle forEach loops
function handleLoops(template, data) {
  // Make sure we have some default values to prevent errors
  data.locals = data.locals || { query: {} };
  
  // Handle basic forEach pattern
  let result = template.replace(/<%\s*(\w+)\.forEach\(function\((.*?),\s*(.*?)\)\s*{\s*%>([\s\S]*?)<%\s*}\);\s*%>/g, 
    (match, arrayName, item, index, block) => {
      try {
        let array = data[arrayName] || [];
        
        // Handle the case where units/photos might be in a results property
        if (array.results && Array.isArray(array.results)) {
          array = array.results;
        }
        
        if (!Array.isArray(array)) {
          console.error('Not an array:', arrayName, array);
          return '';
        }
        
        return array.map((unit, idx) => {
          // Create a new context for this iteration
          const loopContext = { ...data, [item]: unit, [index]: idx };
          return processTemplate(block, loopContext);
        }).join('');
      } catch (e) {
        console.error('Error in forEach:', e);
        return '';
      }
    }
  );
  
  // Add handling for pagination variables
  const paginationVarPattern = /<% *\n.*const query = locals\.query \|\| \{\}.*\n.*const itemsPerPage = (\d+);.*\n.*const currentPage = parseInt\(query\.page \|\| 1\);.*\n.*const totalPages = Math\.ceil\(photos\.length \/ itemsPerPage\);.*\n.*const startIndex = \(currentPage - 1\) \* itemsPerPage;.*\n.*const paginatedPhotos = \[\.\.\.(photos|[^\]]+)\]\.reverse\(\)\.slice\(startIndex, startIndex \+ itemsPerPage\);.*\n.*%>/s;
  
  result = result.replace(paginationVarPattern, () => {
    // Just handle this by setting the variables directly rather than trying to execute the code
    data.itemsPerPage = 50;
    data.currentPage = 1;
    data.totalPages = data.photos && data.photos.length ? Math.ceil(data.photos.length / 50) : 1;
    data.paginatedPhotos = data.photos && data.photos.length ? 
      (data.photos.slice(0, 50)) : 
      [];
    
    return ''; // Remove this block as we've manually set the variables
  });
  
  // Handle the photo pagination loop
  const photoLoopPattern = /<%\s*paginatedPhotos\.forEach\(function\((.*?),.*?\)\s*{\s*%>([\s\S]*?)<%\s*}\);\s*%>/g;
  result = result.replace(photoLoopPattern, (match, photo, block) => {
    try {
      const photos = data.paginatedPhotos || [];
      return photos.map((photoItem) => {
        const loopContext = { ...data, [photo]: photoItem };
        return processTemplate(block, loopContext);
      }).join('');
    } catch (e) {
      console.error('Error in photo pagination loop:', e);
      return '';
    }
  });
  
  return result;
}

// Improved locomotive page rendering function
function renderLocoPageWithTemplate(unit, units, photos) {
  try {
    // Normalize the data structure to be more consistent
    const normalizedUnits = units && units.results ? units.results : [unit];
    const normalizedPhotos = photos && photos.results ? photos.results : [];
    
    // Add missing fields with defaults to prevent template errors
    unit = {
      railroad: unit.railroad || 'Unknown',
      number: unit.number || '0000',
      model: unit.model || 'Unknown',
      serial_number: unit.serial_number || '',
      order_number: unit.order_number || '',
      frame_number: unit.frame_number || '',
      built_date: unit.built_date || '',
      notes: unit.notes || '',
      ...unit
    };
    
    // Log what we're rendering with
    console.log(`Rendering template with: ${unit.railroad} ${unit.number}, ${normalizedUnits.length} related units, and ${normalizedPhotos.length} photos`);
    
    // Process the template with our normalized data and additional helper functions
    return processTemplate(locoTemplate, {
      unit,
      units: normalizedUnits,
      photos: normalizedPhotos,
      locals: { query: {} },
      // Provide helper functions directly in the context
      formatRailroadName,
      formatModelName,
      encodeURIComponent
    });
  } catch (error) {
    console.error('Error rendering template:', error);
    // Generate a simple fallback template if the main one fails
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${unit.railroad} ${unit.number} | Railhub Pictures</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Inter', sans-serif; margin: 0; padding: 20px;">
        <h1>${unit.railroad} ${unit.number} (${formatModelName(unit.model)})</h1>
        <p>Detailed information for this locomotive is available.</p>
        <p><a href="/">Return to home page</a></p>
      </body>
      </html>
    `;
  }
}

// Legacy template function for backup
function renderLocoPage(unit) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= unit.railroad %> <%= unit.number %> (<%= unit.model %>) | Railhub Pictures</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
    <link href="stylesheet/styles.css" rel="stylesheet">
    <link href="stylesheet/locopicture.css" rel="stylesheet">
    <script src="Scripts/random-images.js"></script>
    <script src="Scripts/user-auth.js"></script>
    <style>
    </style>
    <%
    function formatRailroadName(railroad) {
        const suffixes = {
            'BNSF': 'Railway',
            'CSX': 'Transportation',
            'NS': 'Railway',
            'UP': 'Railroad',
            'CN': 'Railway',
            'CP': 'Railway',
            'KCS': 'Railway'
        };
        return suffixes[railroad] ? railroad + ' ' + suffixes[railroad] : railroad;
    }

    function formatModelName(model) {
        if (model.startsWith('SD') || model.startsWith('GP') || model.startsWith('MP') || 
            model.startsWith('F') || model.startsWith('SW') || model.startsWith('NW')) {
            return 'EMD ' + model;
        }
        if (model.startsWith('ES') || model.startsWith('ET') || model.startsWith('AC') || 
            model.startsWith('B') || model.startsWith('C') || model.startsWith('U')) {
            return 'GE ' + model;
        }
        return model;
    }
    %>
</head>
<body>
    <header style="padding: 1rem 0; background: #fff; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; font-family: 'Inter', Helvetica, Arial, sans-serif; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-bottom: 1px solid #eee;">
        <div style="display: flex; flex-direction: column; max-width: 1400px; margin: 0 auto; padding: 0 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <a href="https://railhubpictures.org/index.html" style="display: flex; align-items: center;">
                    <img src="https://railhubpictures.org/images/logo.jpg" alt="Logo" style="max-width: 300px; height: auto;">
                </a>
                <div style="display: flex; align-items: center; gap: 2rem;">
                    <span style="color: #666; font-size: 0.95em;" id="userInfo"></span>
                    <script>
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, '0');
                        var mm = String(today.getMonth() + 1).padStart(2, '0');
                        var yyyy = today.getFullYear();
                        document.write('<span style="color: #666;">' + mm + '/' + dd + '/' + yyyy + '</span>');
                    </script>
                    <div style="display: flex; gap: 1rem;">
                        <a href="https://railhubpictures.org/login.html" style="color: #444; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #f5f5f5; transition: all 0.2s; font-size: 0.95em; border: 1px solid #eee;">Log In</a>
                        <a href="https://railhubpictures.org/register.html" style="color: #fff; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #444; transition: all 0.2s; font-size: 0.95em;">Register</a>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <nav style="display: flex; gap: 2.5rem;">
                    <a href="https://railhubpictures.org/index.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Home</a>
                    <a href="https://railhubpictures.org/newestphotos.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Latest Photos</a>
                    <a href="https://railhubpictures.org/contribPicks.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Contributor Picks</a>
                    <a href="https://railhubpictures.org/railroadList.html" style="color: #444; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s;">Railroads</a>
                </nav>
                <div style="display: flex; gap: 1.5rem; align-items: center; margin-left: 4rem;">
                    <form action="https://railhubpictures.org/search.html" method="get" style="display: flex; gap: 0.5rem;">
                        <input type="text" name="q" placeholder="Search..." style="padding: 0.7em 1em; border: 1px solid #eee; border-radius: 6px; font-size: 0.95em; width: 240px; background: #f5f5f5; color: #444; font-family: 'Inter', sans-serif;">
                        <button type="submit" style="background: #444; color: #fff; border: none; padding: 0.7em 1.2em; border-radius: 6px; font-size: 0.95em; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 500; transition: all 0.2s;">Search</button>
                    </form>
                    <a href="https://railhubpictures.org/upload.html" style="color: #fff; text-decoration: none; font-weight: 500; font-size: 0.95em; transition: all 0.2s; background: #444; padding: 0.7em 1.4em; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.5rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="content">
            <div style="margin-bottom: 1rem;">
                <div class="breadcrumb" style="justify-content: flex-start; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid #eee;">
                    <a href="/">Home</a>
                    <span>›</span>
                    <a href="/railroad/<%= unit.railroad %>"><%= formatRailroadName(unit.railroad) %></a>
                    <span>›</span>
                    <a href="/railroad/<%= unit.railroad %>/models">Locomotive Models</a>
                    <span>›</span>
                    <a href="/railroad/<%= unit.railroad %>/<%= unit.model %>"><%= formatModelName(unit.model) %></a>
                    <span>›</span>
                    <span><%= unit.railroad %> <%= unit.number %></span>
                </div>

                <h1 style="text-align: left; margin: 0.5rem 0;">
                    <%= unit.railroad %> <%= unit.number %> (<%= formatModelName(unit.model) %>)
                </h1>
            </div>
            <div class="locomotive-info" style="max-width: 100%;">
                <div style="font-size: 0.85rem;">
                <% if (units && units.length > 0) { %>
                    <div style="display: flex; margin-bottom: 0.5rem;">
                        <div style="width: 300px;">
                            <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Owner:</span>
                            <span style="margin-left: 0.5rem;"><a href="/railroad/<%= unit.railroad %>" style="text-decoration: underline; color: #333; font-weight: 600;"><%= formatRailroadName(unit.railroad) %></a></span>
                        </div>
                        <div style="margin-left: 2rem;">
                            <span style="display: inline-block; width: 80px; text-align: right; font-weight: 600; color: #555;">Model:</span>
                            <span style="margin-left: 0.5rem;"><%= formatModelName(unit.model) %></span>
                        </div>
                    </div>

                    <div style="margin-bottom: 0.5rem;">
                        <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Locomotive<%= units.length > 1 ? 's' : '' %>:</span>
                        <span style="margin-left: 0.5rem;">
                            <% units.forEach(function(unitInPhoto, index) { %>
                                <a href="/locopictureid=<%= unitInPhoto.photo_unit_id %>" style="color: #333; text-decoration: underline;">
                                    <%= unitInPhoto.railroad %> <%= unitInPhoto.number %> (<%= formatModelName(unitInPhoto.model) %>)
                                </a>
                                <% if (index < units.length - 1) { %><span style="margin: 0 0.5rem;">•</span><% } %>
                            <% }); %>
                        </span>
                    </div>
                <% } else { %>
                    <div class="no-units">
                        <p>No locomotive information available.</p>
                    </div>
                <% } %>
                <div class="technical-info">
                    <% if (units.length > 0) { %>
                        <div>
                        </div>

                            <div style="display: flex; margin-bottom: 0.5rem;">
                                <div style="width: 300px;">
                                    <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Serial Number:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.serial_number) { %>
                                            <a href="/search?serial=<%= unit.serial_number %>" style="text-decoration: underline; color: #333; font-weight: 600;"><%= unit.serial_number %></a>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                                <div style="margin-left: 2rem;">
                                    <span style="display: inline-block; width: 80px; text-align: right; font-weight: 600; color: #555;">Order No:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.order_number) { %>
                                            <a href="/search?order=<%= unit.order_number %>" style="text-decoration: underline; color: #333; font-weight: 600;"><%= unit.order_number %></a>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                            </div>

                            <div style="display: flex; margin-bottom: 0.5rem;">
                                <div style="width: 300px;">
                                    <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Frame Number:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.frame_number) { %>
                                            <%= unit.frame_number %>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                                <div style="margin-left: 2rem;">
                                    <span style="display: inline-block; width: 80px; text-align: right; font-weight: 600; color: #555;">Built:</span>
                                    <span style="margin-left: 0.5rem;">
                                        <% if (unit.built_date) { %>
                                            <%= unit.built_date %>
                                        <% } else { %>
                                            <span style="color: #777;">-</span>
                                        <% } %>
                                    </span>
                                </div>
                            </div>

                            <div style="margin-bottom: 0.5rem;">
                                <span style="display: inline-block; width: 180px; text-align: right; font-weight: 600; color: #555;">Notes:</span>
                                <span style="margin-left: 0.5rem;">
                                    <% if (unit.notes) { %>
                                        <%= unit.notes %>
                                    <% } else { %>
                                        <span style="color: #777;">-</span>
                                    <% } %>
                                </span>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; text-align: left; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;"></h2>
            
            <div class="photo-grid" style="gap: 0.5rem;">
                <% 
                const query = locals.query || {};
                const itemsPerPage = 50;
                const currentPage = parseInt(query.page || 1);
                const totalPages = Math.ceil(photos.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedPhotos = [...photos].reverse().slice(startIndex, startIndex + itemsPerPage);
                %>
                <% paginatedPhotos.forEach(function(photo) { %>
                <div class="photo-card" style="margin-bottom: 0.25rem;">
                    <a href="/showpictureid=<%= photo.id %>">
                        <img src="/uploads/<%= photo.filename %>" alt="<%= unit.railroad %> <%= unit.number %> at <%= photo.location %>" class="photo-image">
                    </a>
                    <div class="photo-details" style="font-size: 0.9rem; padding: 0.5rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;"><%= photo.title %></h3>
                        <p style="font-size: 0.8rem; color: #666; margin-bottom: 0.25rem; padding-bottom: 0.25rem; border-bottom: 1px solid #eee;"><%= photo.description %></p>
                        
                        <div class="photo-meta">
                            <div>
                                <p style="margin-bottom: 0.25rem;">
                                    <span style="font-weight: 600; color: #555;">Location:</span>
                                    <span style="margin-left: 0.25rem;"><a href="/search?location=<%= encodeURIComponent(photo.location) %>" style="text-decoration: none; color: #333;"><%= photo.location %></a></span>
                                    <span style="margin: 0 0.6rem;"></span>
                                    <span style="font-weight: 600; color: #555;"> Stats:</span>
                                    <span style="margin-left: 0.25rem;"><%= photo.view_count || 0 %> views  <%= photo.comment_count || 0 %> comments</span>
                                </p>
                                
                                <p style="margin-bottom: 0.5rem;">
                                    <span style="font-weight: 600; color: #555;">Author:</span>
                                    <span style="margin-left: 0.25rem;"><a href="/user/<%= photo.user_id %>" style="text-decoration: none; color: #333;"><%= photo.display_name %></a></span>
                                </p>
                                
                                <p style="margin-bottom: 0.5rem;">
                                    <span style="font-weight: 600; color: #555;">Photo Date:</span>
                                    <span style="margin-left: 0.25rem;"><%= new Date(photo.photo_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) %></span>
                                    <span style="margin: 0 0.5rem;">•</span>
                                    <span style="font-weight: 600; color: #555;">Upload Date:</span>
                                    <span style="margin-left: 0.25rem;"><%= new Date(photo.uploaded_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) %> <%= new Date(photo.uploaded_at).toLocaleTimeString('en-US') %></span>
                                </p>
                                
                                <p style="margin-bottom: 0;">
                                    <span style="font-weight: 600; color: #555;">Locomotives:</span>
                                    <span style="margin-left: 0.25rem;">
                                        <% if (photo.units && photo.units.length > 0) { %>
                                            <% photo.units.forEach(function(unitInPhoto, index) { %>
                                                <a href="/unit/<%= unitInPhoto.railroad %>/<%= unitInPhoto.number %>" title="View <%= unitInPhoto.railroad %> <%= unitInPhoto.number %>" style="text-decoration: underline; color: #333; font-weight: 600;">
                                                    <%= unitInPhoto.railroad %> <%= unitInPhoto.number %> (<%= formatModelName(unitInPhoto.model) %>)
                                                </a>
                                                <% if (index < photo.units.length - 1) { %> • <% } %>
                                            <% }); %>
                                        <% } else { %>
                                            Unknown
                                        <% } %>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <% }); %>
            </div>
            
            <% if (photos.length > itemsPerPage) { %>
            <div style="display: flex; justify-content: center; align-items: center; padding: 1rem 0; border-top: 1px solid #eee; margin: 1rem 0;">
                <div style="text-align: center; font-size: 0.9rem; color: #666; display: flex; gap: 0.5rem; align-items: center;">
                    <% if (currentPage > 1) { %>
                        <a href="?page=<%= currentPage - 1 %>" style="color: #444; text-decoration: none; padding: 0.3em 0.6em; border: 1px solid #ddd; border-radius: 4px;">Previous</a>
                    <% } %>
                    <span>Page <%= currentPage %> of <%= totalPages %></span>
                    <% if (currentPage < totalPages) { %>
                        <a href="?page=<%= currentPage + 1 %>" style="color: #444; text-decoration: none; padding: 0.3em 0.6em; border: 1px solid #ddd; border-radius: 4px;">Next</a>
                    <% } %>
                </div>
            </div>
            <% } else { %>
            <div style="display: flex; justify-content: center; align-items: center; padding: 0.5rem 0; border-top: 1px solid #eee; margin: 1rem 0;">
                <div style="text-align: center; font-size: 0.9rem; color: #666;">
                    Page 1 of 1
                </div>
            </div>
            <% } %>
        </div>
    </main>

    <!-- Footer will be inserted by footer.js -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Make sure the footer has proper styling
            setTimeout(function() {
                const footer = document.querySelector('.site-footer');
                if (footer) {
                    footer.style.position = 'static';
                    footer.style.marginTop = '2rem';
                    footer.style.width = '100%';
                }
            }, 100);
        });
    </script>
</body>
</html> `;
}

// List of authorized admin user IDs
const ADMIN_USER_IDS = [1]; // Replace with actual admin user IDs

// CORS headers function
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true', // Important for authenticated requests
  };
}

// Handle CORS preflight
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let pathname = url.pathname;
      
      console.log(`Handling request for: ${url.href}, pathname: ${pathname}`);
      
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return handleCORS();
      }
      
      // Enhanced path handling for better reliability across domains
      const host = url.hostname;
      
      // Log incoming request for debugging
      console.log(`Incoming request: ${request.method} ${host}${pathname}`);
      
      // Handle API subdomains consistently
      if ((host === 'api.railhubpictures.org' || host === 'railhub-api.railhubpictures.org')) {
        if (!pathname.startsWith('/api/')) {
          // If this is a root request to the API subdomain
          if (pathname === '/' || pathname === '') {
            pathname = '/api/';
          } else {
            // For any other path on the API subdomain, prefix with /api/
            pathname = '/api/' + pathname.replace(/^\//, '');
          }
          console.log(`Rewriting API subdomain path to: ${pathname}`);
        }
      }
      
      // Handle health checks and return basic info
      if (pathname === '/health' || pathname === '/healthz' || 
          pathname === '/api/health' || pathname === '/api/healthz') {
        return jsonResponse({
          status: 'ok',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          worker: 'railhub-api',
          environment: env.ENVIRONMENT || 'production'
        });
      }

      // Handle locomotive detail page requests
      console.log(`Checking if pathname: ${pathname} includes locopictureid=`);
      if (pathname.includes('locopictureid=')) {
        try {
          console.log('Detected locomotive picture page request');
          console.log(`Full URL: ${url.href}`);
          console.log(`Pathname: ${pathname}`);
          
          // Extract ID from pathname
          const idMatch = pathname.match(/locopictureid=(\d+)/);
          if (!idMatch || !idMatch[1]) {
            return new Response('Invalid locomotive ID format', { status: 400 });
          }
          
          const locoId = idMatch[1];
          console.log(`Looking up locomotive with ID: ${locoId}`);
          
          // Get unit data from database
          const unit = await env.DB.prepare(`SELECT * FROM units WHERE id = ?`).bind(locoId).first();
          
          if (!unit) {
            console.log(`Locomotive with ID ${locoId} not found in database`);
            return new Response('Locomotive not found', { status: 404 });
          }
          
          console.log(`Found locomotive: ${unit.railroad} ${unit.number}`);
          
          // Get additional units for this photo if it's a consist
          const units = await env.DB.prepare(`
            SELECT u.* 
            FROM units u
            JOIN photo_units pu ON u.id = pu.unit_id
            WHERE pu.photo_id = (
              SELECT photo_id FROM photo_units WHERE unit_id = ?
            )
            ORDER BY u.railroad, u.number
          `).bind(locoId).all();
          
          // Get photos featuring this unit
          const photos = await env.DB.prepare(`
            SELECT p.* 
            FROM photos p 
            JOIN photo_units pu ON p.id = pu.photo_id 
            WHERE pu.unit_id = ?
            ORDER BY p.id DESC
          `).bind(locoId).all();
          
          console.log(`Found ${units.results.length} units and ${photos.results.length} photos`);
          
          try {
            // Log what we're sending to the template renderer
            console.log(`Rendering page for unit: ${unit.railroad} ${unit.number}`);
            console.log(`Found ${units.results ? units.results.length : 0} related units`);
            console.log(`Found ${photos.results ? photos.results.length : 0} photos`);
            
            // Use our custom template rendering
            const renderedPage = renderLocoPageWithTemplate(
              unit, 
              units, // Pass the entire units object, our renderer will handle the .results property
              photos // Pass the entire photos object, our renderer will handle the .results property
            );
            
            return new Response(renderedPage, {
              headers: {
                'Content-Type': 'text/html'
              }
            });
          } catch (templateError) {
            // Fall back to the embedded template if our template rendering fails
            console.error('Template rendering failed, falling back to embedded template:', templateError);
            const renderedPage = renderLocoPage(unit);
            
            return new Response(renderedPage, {
              headers: {
                'Content-Type': 'text/html'
              }
            });
          }
        } catch (error) {
          console.error('Error handling locomotive page:', error);
          return new Response(`Error displaying locomotive: ${error.message}`, { status: 500 });
        }
      }
      
      // Route API requests
      if (pathname.startsWith('/api/')) {
        try {
          // Special handler for the root API path
          if (pathname === '/api/' || pathname === '/api') {
            console.log('Handling root API path request');
            return jsonResponse({
              name: "RailHub Pictures API",
              version: "1.0.0", 
              description: "API for RailHub Pictures platform",
              endpoints: [
                "/api/photos/latest",
                "/api/photos/{id}",
                "/api/photos/upload", 
                "/api/users/profile",
                "/api/units"
              ]
            });
          }
          
            // Latest photos endpoint
          if (pathname === '/api/photos/latest' && request.method === 'GET') {
            const limit = url.searchParams.get('limit') || 10;
            const photos = await env.DB.prepare(`SELECT * FROM photos ORDER BY id DESC LIMIT ?`).bind(limit).all();
            return jsonResponse(photos);
          }
          
          // All photos endpoint
          if (pathname === '/api/photos/' && request.method === 'GET') {
            const photos = await env.DB.prepare(`SELECT * FROM photos ORDER BY id DESC`).all();
            return jsonResponse(photos);
          }          // Single photo endpoint
          if (pathname.match(/^\/api\/photos\/\d+$/) && request.method === 'GET') {
            const id = pathname.split('/').pop();
            const photo = await env.DB.prepare(`SELECT * FROM photos WHERE id = ?`).bind(id).first();
            if (!photo) return jsonResponse({ error: 'Photo not found' }, 404);
            return jsonResponse(photo);
          }
          
          // Units endpoint - GET all units
          if (pathname === '/api/units' && request.method === 'GET') {
            const units = await env.DB.prepare(`SELECT * FROM units ORDER BY railroad, number`).all();
            return jsonResponse(units);
          }
          
          // Single unit endpoint
          if (pathname.match(/^\/api\/units\/\d+$/) && request.method === 'GET') {
            const id = pathname.split('/').pop();
            const unit = await env.DB.prepare(`SELECT * FROM units WHERE id = ?`).bind(id).first();
            if (!unit) {
              return jsonResponse({ error: 'Unit not found' }, 404);
            }
            return jsonResponse(unit);
          }
          
          // Unit photos endpoint
          if (pathname.match(/^\/api\/units\/\d+\/photos$/) && request.method === 'GET') {
            const unitId = pathname.split('/')[3];
            const photos = await env.DB.prepare(`
              SELECT p.* 
              FROM photos p 
              JOIN photo_units pu ON p.id = pu.photo_id 
              WHERE pu.unit_id = ?
            `).bind(unitId).all();
            return jsonResponse(photos);
          }
          
          // Units endpoint - POST new unit
          if (pathname === '/api/units' && request.method === 'POST') {
            try {
              // Parse request body
              const data = await request.json();
              
              // Validate required fields
              if (!data.railroad || !data.number) {
                return jsonResponse({
                  error: 'Validation failed',
                  message: 'Railroad and number are required fields',
                  details: {
                    railroad: data.railroad ? null : 'Railroad is required',
                    number: data.number ? null : 'Number is required'
                  }
                }, 400);
              }
              
              // Create the new unit
              const result = await env.DB.prepare(`
                INSERT INTO units (railroad, number, model, serial_number, order_number, frame_number, built_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                data.railroad,
                data.number,
                data.model || null,
                data.serial_number || null,
                data.order_number || null,
                data.frame_number || null,
                data.built_date || null,
                data.notes || null
              ).run();
              
              // Get the ID of the newly created unit
              const newUnit = await env.DB.prepare(`SELECT * FROM units WHERE id = last_insert_rowid()`).first();
              
              return jsonResponse({
                message: 'Unit created successfully',
                unit: newUnit
              }, 201);
            } catch (error) {
              console.error('Error creating unit:', error);
              return jsonResponse({
                error: 'Failed to create unit',
                message: error.message
              }, 500);
            }
          }
          
          // Default response for unknown API routes
          return jsonResponse({ 
            error: 'API endpoint not found', 
            requested: pathname,
            method: request.method,
            available_endpoints: ["/api/", "/api/photos/latest", "/api/photos/{id}", "/api/units"]
          }, 404);
        } catch (error) {
          console.error('API error:', error);
          return jsonResponse({ error: 'Internal server error', details: error.message }, 500);
        }
      }
      
      // Let Cloudflare serve static files and handle other paths
      return new Response('Not found', { status: 404 });
    } catch (error) {
      console.error('Worker global error:', error);
      return new Response(JSON.stringify({
        error: 'Worker exception',
        message: error.message || 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
