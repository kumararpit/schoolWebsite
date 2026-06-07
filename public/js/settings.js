/**
 * Goura City Montessori - Dynamic Site Settings Helper
 * 
 * Fetches configured variables from '/api/settings' and populates them into designated DOM elements.
 * Alert banner is hidden by CSS default; this script decides whether to show it.
 * Fallback: if backend is unreachable, banner is shown with its hardcoded HTML content.
 */

async function initDynamicSettings() {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      console.warn('API returned non-OK status. Preserving HTML hardcoded defaults.');
      // Show banner with default HTML content as fallback
      document.querySelectorAll('.alert-banner').forEach(el => {
        el.style.display = 'block';
      });
      return;
    }
    const settings = await response.json();
    if (!settings || typeof settings !== 'object') {
      // Show banner with default HTML content as fallback
      document.querySelectorAll('.alert-banner').forEach(el => {
        el.style.display = 'block';
      });
      return;
    }

    // 1. Phone Numbers Update
    if (settings.phone) {
      const cleanPhone = settings.phone.replace(/\s+/g, '');
      document.querySelectorAll('.dynamic-phone').forEach(el => {
        if (el.tagName === 'A') {
          el.href = `tel:${cleanPhone}`;
        }
        el.textContent = settings.phone;
      });
    }

    // 2. Email Addresses Update
    if (settings.email) {
      document.querySelectorAll('.dynamic-email').forEach(el => {
        if (el.tagName === 'A') {
          el.href = `mailto:${settings.email}`;
        }
        el.textContent = settings.email;
      });
    }

    // 3. Addresses Update
    if (settings.address) {
      document.querySelectorAll('.dynamic-address').forEach(el => {
        el.textContent = settings.address;
      });
    }

    // 4. Map Coordinates Redirect Links Update
    if (settings.map_link) {
      document.querySelectorAll('.dynamic-map-link').forEach(el => {
        el.href = settings.map_link;
      });
    }

    // 5. Alert Banner Text Update
    if (settings.announcement) {
      document.querySelectorAll('.dynamic-announcement').forEach(el => {
        el.textContent = settings.announcement;
      });
    }

    // 6. Alert Banner Visibility — only show if explicitly enabled
    const showBanner = (settings.announcement_enabled === true || settings.announcement_enabled === 'true');
    document.querySelectorAll('.alert-banner').forEach(el => {
      el.style.display = showBanner ? 'block' : 'none';
    });
    
    // 7. Principal Photo Update
    if (settings.principal_photo) {
      document.querySelectorAll('.dynamic-principal-photo').forEach(el => {
        el.src = settings.principal_photo;
      });
    }

  } catch (err) {
    console.warn('Failed to connect to backend configuration API. Serving static HTML content defaults.', err);
    // Show banner with default HTML content as fallback
    document.querySelectorAll('.alert-banner').forEach(el => {
      el.style.display = 'block';
    });
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDynamicSettings);
} else {
  initDynamicSettings();
}
