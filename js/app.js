/**
 * ====================================================================================
 * RAMDEV ENTERPRISE — CORE SYSTEM JAVASCRIPT ENGINE
 * ====================================================================================
 * File: js/app.js
 * Language: JavaScript (ES6+ / Vanilla JS)
 * Project: Ramdev Enterprise — Wholesale & Retail E-Commerce & Management System
 * 
 * DESCRIPTION:
 * This script contains the complete business logic, reactive state management,
 * and user interaction handlers for the entire platform:
 *   - Module 1: Central Reactive State & LocalStorage Configuration
 *   - Module 2: Master Product Catalog & Multi-Tier Pricing (Retail vs. Wholesale)
 *   - Module 3: Dynamic Product Card Rendering & Stock Badge Engine
 *   - Module 4: Dual-Portal Isolation (Wholesale MOQ vs. Retail Single Unit)
 *   - Module 5: Cart Management, Coupon Verification & 18% GST Calculations
 *   - Module 6: Real-time Live Catalog Search & Category Filter Navigation
 *   - Module 7: Live Order Tracking, Consignment & Bilty Lookup Engine
 *   - Module 8: Customer Complaint Ticketing & Instant WhatsApp Help Desk
 *   - Module 9: Owner PIN-Protected Master Administration Panel & Stock In/Out Engine
 *   - Module 10: GST-Compliant Printable Invoice Generator & Export System
 * ====================================================================================
 */

/**
     * =================================================================================
     * RAMDEV ENTERPRISE — CORE SYSTEM ARCHITECTURE
     * =================================================================================
     * This script powers all interactions across the website:
     * - Module 1: Central Reactive State & Configuration
     * - Module 2: Master Product Catalog Data & Technical Specifications
     * - Module 3: Dynamic Catalog Card Rendering Engine
     * - Module 4: Strict Retail vs. Wholesale Dual-Portal Isolation Engine
     * - Module 5: Shopping Cart & 18% GST Tax Engine (HSN 3923 Plastics)
     * - Module 6: Navigation, Category Switcher & Live Search Engine
     * - Module 7: Modal Window Management System
     * - Module 8: Pincode Delivery & Freight Logistics Calculator
     * - Module 9: Product Technical Specifications & Volume Slabs Modal
     * - Module 10: GST Tax Proforma Invoice & Printable PDF Engine
     * - Module 11: Real-Time 4-Step Consignment Waybill Tracker
     * - Module 12: User Authentication & Dual OTP Verification Engine
     * - Module 13: Owner Admin Dashboard & Live Inventory Register
     * - Module 14: System Bootstrap & Portal Gateway Initialization
     * =================================================================================
     */

    
    // =================================================================================
    // STEP 2 MASTER PLAN: ENTRY AUTHENTICATION GATEWAY CONTROLLER
    // Powered by Firebase Authentication (v10 Modular via CDN)
    // Features:
    // 1. Real Email Verification with sendEmailVerification()
    // 2. Unverified Account Blocking with Resend Verification Link
    // 3. Uniform "Invalid User ID or Password" Security Errors
    // 4. Central Route & View Guarding via onAuthStateChanged()
    // =================================================================================

    // View Switchers
    function showGateLoginView() {
      const card = document.getElementById('authGateCard') || document.querySelector('.auth-gate-card');
      if (card) card.classList.remove('is-signup');
      const backBtn = document.getElementById('gateSignupBackBtn');
      if (backBtn) backBtn.style.display = 'none';

      const loginView = document.getElementById('gateLoginView');
      const signupView = document.getElementById('gateSignupView');
      const otpView = document.getElementById('gateOtpView');
      const alertBox = document.getElementById('gateLoginAlert');
      if (loginView) loginView.style.display = 'block';
      if (signupView) signupView.style.display = 'none';
      if (otpView) otpView.style.display = 'none';
      if (alertBox) alertBox.style.display = 'none';
    }

    function showGateSignupView() {
      const card = document.getElementById('authGateCard') || document.querySelector('.auth-gate-card');
      if (card) card.classList.add('is-signup');
      const backBtn = document.getElementById('gateSignupBackBtn');
      if (backBtn) backBtn.style.display = 'inline-flex';

      const loginView = document.getElementById('gateLoginView');
      const signupView = document.getElementById('gateSignupView');
      const otpView = document.getElementById('gateOtpView');
      if (loginView) loginView.style.display = 'none';
      if (signupView) signupView.style.display = 'block';
      if (otpView) otpView.style.display = 'none';
    }

    function validateGateLoginLive(input) {
      const hint = document.getElementById('gateLoginHint');
      const val = input.value.trim();
      const alertBox = document.getElementById('gateLoginAlert');
      if (alertBox) alertBox.style.display = 'none';

      if (!val) {
        input.classList.remove('is-valid', 'has-error');
        if (hint) hint.textContent = '';
        return false;
      }
      return validateEmailLive(input, 'gateLoginHint');
    }

    function enterStorefront(portal) {
      sessionStorage.setItem('ramdevSessionActive', 'true');
      const authGate = document.getElementById('entryAuthGateScreen');
      const mainApp = document.getElementById('mainStorefrontApp');
      if (authGate) authGate.style.display = 'none';
      if (mainApp) mainApp.style.display = 'flex';

      if (portal === 'wholesale') {
        setPriceMode('wholesale');
      } else {
        setPriceMode('retail');
      }

      applyCurrentUserState();
      showHomePage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.enterStorefront = enterStorefront;
    window.showGateLoginView = showGateLoginView;
    window.showGateSignupView = showGateSignupView;

    // --- MODULE 1: CENTRAL APPLICATION STATE ---
    let priceMode = 'retail';
    let cart = [];
    let stocks = (() => { try { return JSON.parse(localStorage.getItem('ramdevStocks')) || { 1: 850, 2: 520, 3: 340, 4: 420, 5: 600, 6: 280, 7: 950, 8: 150 }; } catch(e) { return { 1: 850, 2: 520, 3: 340, 4: 420, 5: 600, 6: 280, 7: 950, 8: 150 }; } })();
    const defaultFactoryStocks = { 1: 850, 2: 520, 3: 340, 4: 420, 5: 600, 6: 280, 7: 950, 8: 150 };
    let currentFilterCat = 'all';
    let currentFilterSub = 'all';
    let inStockOnly = false;
    let currentSort = 'featured';
    let pendingDealerData = null;
    let pendingSignupData = null;

    const PHONE_REGEX = /^[6-9]\d{9}$/;
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const EXPECTED_MOBILE_OTP = '4819';
    const EXPECTED_EMAIL_OTP = '9352';

    // --- MODULE 2: MASTER PRODUCT CATALOG DATA ---
    // Defines all 8 products: Retail pricing, Wholesale factory rates, MOQs,
    // technical specifications, volume discount slabs, and verified assets.
    const productsData = {
      1: {
        id: 1,
        title: 'Standard Clear Plastic Water Bottle with Screw Cap',
        cat: 'bottle',
        sub: 'normal',
        badgeDeal: 'POPULAR',
        rating: 4.8,
        ratingCount: 118,
        catTag: '1. Plastic Bottles › Standard',
        img: './assets/normal_plastic_bottle.jpg',
        retailMrp: 35,
        retailPrice: 22,
        retailUnit: '/ piece',
        retailDelivery: '🚚 <strong>Courier / Parcel Delivery</strong> Available',
        wholesalePrice: 14,
        wholesaleMoq: 100,
        wholesaleUnit: '/ piece (Box of 100)',
        wholesaleDelivery: '🚚 <strong>Transport Logistics Bilty</strong> Pallet Booking',
        specs: { 'Material': 'Virgin PET Grade 1', 'Capacity': '1000 ml', 'Cap Type': 'Ribbed Screw Seal', 'Food Grade': 'Yes (BPA Free)', 'Carton Master': '100 Bottles / Master Bag' },
        slabs: [ { slab: '100 - 499 Pcs', rate: '₹14.00' }, { slab: '500 - 1,999 Pcs', rate: '₹13.25' }, { slab: '2,000+ Pcs (Truckload)', rate: '₹12.50' } ]
      },
      2: {
        id: 2,
        title: 'Threaded Airtight Plastic Bottle with Ribbed Seal Cap (Leak-Proof)',
        cat: 'bottle',
        sub: 'threading',
        badgeDeal: 'HEAVY THREAD',
        rating: 4.7,
        ratingCount: 94,
        catTag: '1. Plastic Bottles › Threaded',
        img: './assets/threading_bottle.jpg',
        retailMrp: 65,
        retailPrice: 42,
        retailUnit: '/ piece',
        retailDelivery: '🚚 <strong>Chemical & Oil Safe</strong> Deep Threading',
        wholesalePrice: 28,
        wholesaleMoq: 50,
        wholesaleUnit: '/ piece (Box of 50)',
        wholesaleDelivery: '🚚 <strong>Direct Factory Master Lot</strong> Dispatch',
        specs: { 'Material': 'High Tensile HDPE / PET', 'Capacity': '750 ml', 'Seal': 'Airtight Deep Threading', 'Safety': 'Chemical & Acid Proof', 'Master Lot': '50 Pcs / Box' },
        slabs: [ { slab: '50 - 199 Pcs', rate: '₹28.00' }, { slab: '200 - 499 Pcs', rate: '₹26.50' }, { slab: '500+ Pcs', rate: '₹25.00' } ]
      },
      3: {
        id: 3,
        title: 'Portable Plastic Water Dispenser Bottle with Push Tap & Handle',
        cat: 'bottle',
        sub: 'nal',
        badgeDeal: 'TAP DISPENSER',
        rating: 4.9,
        ratingCount: 185,
        catTag: '1. Plastic Bottles › Tap Dispenser',
        img: './assets/nal_wali_bottle.jpg',
        retailMrp: 220,
        retailPrice: 155,
        retailUnit: '/ piece',
        retailDelivery: '🚚 <strong>Fitted Leak-Proof Dispenser Tap</strong> Included',
        wholesalePrice: 110,
        wholesaleMoq: 25,
        wholesaleUnit: '/ piece (Carton of 25)',
        wholesaleDelivery: '🚚 <strong>Master Carton Packaging</strong> Transport Dispatch',
        specs: { 'Material': 'Food Grade Polycarbonate', 'Capacity': '5 Litre', 'Features': 'Built-in Push Tap & Top Carry Handle', 'Application': 'Office, Travel, Home', 'Master Box': '25 Units' },
        slabs: [ { slab: '25 - 99 Units', rate: '₹110.00' }, { slab: '100 - 249 Units', rate: '₹102.00' }, { slab: '250+ Units', rate: '₹95.00' } ]
      },
      4: {
        id: 4,
        title: '20L Heavy Duty Diesel & Liquid Jerrycan Container',
        cat: 'diesel',
        sub: 'jerrycan',
        badgeDeal: 'HEAVY DUTY',
        rating: 4.8,
        ratingCount: 210,
        catTag: '2. Diesel Cans › 20 Litre',
        img: './assets/blue_diesel_jerrycan.jpg',
        retailMrp: 320,
        retailPrice: 240,
        retailUnit: '/ piece',
        retailDelivery: '🚚 <strong>Diesel & Fuel Safe</strong> High Density',
        wholesalePrice: 180,
        wholesaleMoq: 50,
        wholesaleUnit: '/ piece (Bundle of 50)',
        wholesaleDelivery: '🚚 <strong>Heavy Transport Goods Carrier</strong> Consignment',
        specs: { 'Material': 'Extra Virgin HDPE polymer', 'Volume': '20 Litres', 'Wall Thickness': 'Heavy 3.5 mm industrial wall', 'Leakproof': 'Inner bung + threaded outer lock cap', 'Flammability': 'Hydrocarbon safe' },
        slabs: [ { slab: '50 - 199 Cans', rate: '₹180.00' }, { slab: '200 - 499 Cans', rate: '₹172.00' }, { slab: '500+ Cans', rate: '₹165.00' } ]
      },
      5: {
        id: 5,
        title: 'HDPE White Industrial Liquid & Diesel Canister (Red Cap)',
        cat: 'diesel',
        sub: 'hdpe',
        badgeDeal: 'TAMPER CAP',
        rating: 4.7,
        ratingCount: 140,
        catTag: '2. Diesel Cans › HDPE White',
        img: './assets/white_jerrycan_hdpe.jpg',
        retailMrp: 180,
        retailPrice: 130,
        retailUnit: '/ piece',
        retailDelivery: '🚚 <strong>Tamper Evident Red Cap</strong> Included',
        wholesalePrice: 95,
        wholesaleMoq: 50,
        wholesaleUnit: '/ piece (Bundle of 50)',
        wholesaleDelivery: '🚚 <strong>Factory Direct Wholesale Supply</strong>',
        specs: { 'Material': 'HDPE White Virgin', 'Volume': '10 Litres', 'Cap Type': 'Tamper Evident Lock Ring', 'Chemical Compatibility': 'Lubricants, Detergents, Agrochemicals', 'Bundle': '50 Pcs' },
        slabs: [ { slab: '50 - 199 Pcs', rate: '₹95.00' }, { slab: '200 - 499 Pcs', rate: '₹89.00' }, { slab: '500+ Pcs', rate: '₹84.00' } ]
      },
      6: {
        id: 6,
        title: 'Un-Breakable Amber Water Cool Jar / Camper with Push Tap',
        cat: 'water',
        sub: 'camper',
        badgeDeal: 'COOL JAR',
        rating: 4.9,
        ratingCount: 265,
        catTag: '3. Water Cool Jars › Camper',
        img: './assets/water_camper_tap.jpg',
        retailMrp: 450,
        retailPrice: 320,
        retailUnit: '/ piece',
        retailDelivery: '🚚 <strong>Food Grade & Un-Breakable</strong> Material',
        wholesalePrice: 240,
        wholesaleMoq: 25,
        wholesaleUnit: '/ piece (Carton of 25)',
        wholesaleDelivery: '🚚 <strong>Heavy Transport Waybill Consignment</strong>',
        specs: { 'Material': 'Double Wall Insulated Food Grade Plastic', 'Volume': '15 Litres', 'Insulation': 'PU Foam for 8h temperature retention', 'Tap': 'Chrome coated heavy push tap', 'Carton': '25 Units' },
        slabs: [ { slab: '25 - 99 Units', rate: '₹240.00' }, { slab: '100 - 249 Units', rate: '₹225.00' }, { slab: '250+ Units', rate: '₹210.00' } ]
      },
      7: {
        id: 7,
        title: 'Disposable Food Packaging Containers & Plastic Glasses Set',
        cat: 'disposable',
        sub: 'cups',
        badgeDeal: 'PACKAGING',
        rating: 4.6,
        ratingCount: 78,
        catTag: '4. Disposable Items › Containers & Cups',
        img: './assets/disposable_food_containers.jpg',
        retailMrp: 120,
        retailPrice: 85,
        retailUnit: '/ pack',
        retailDelivery: '🚚 <strong>Microwave Safe & Clean</strong>',
        wholesalePrice: 60,
        wholesaleMoq: 50,
        wholesaleUnit: '/ pack (Master Carton of 50)',
        wholesaleDelivery: '🚚 <strong>Bulk Wholesale Master Pack</strong>',
        specs: { 'Material': 'Food Grade Polypropylene', 'Pack Size': '50 Containers + Lids', 'Feature': 'Microwave & freezer safe snap closure', 'Use': 'Catering, Cloud Kitchens, Takeaway', 'Master Box': '50 Packs' },
        slabs: [ { slab: '50 - 199 Packs', rate: '₹60.00' }, { slab: '200 - 499 Packs', rate: '₹55.00' }, { slab: '500+ Packs', rate: '₹50.00' } ]
      },
      8: {
        id: 8,
        title: 'Magic 360° Spin Mop & Bucket Set with Microfiber Refills',
        cat: 'other',
        sub: 'mop',
        badgeDeal: 'CLEANING',
        rating: 4.8,
        ratingCount: 190,
        catTag: '5. Other Items › Cleaning',
        img: './assets/spin_mop_bucket.jpg',
        retailMrp: 799,
        retailPrice: 590,
        retailUnit: '/ set',
        retailDelivery: '🚚 <strong>Includes Microfiber Head Refills</strong>',
        wholesalePrice: 450,
        wholesaleMoq: 10,
        wholesaleUnit: '/ set (Crate of 10 Sets)',
        wholesaleDelivery: '🚚 <strong>Distributor Commercial Crate Pricing</strong>',
        specs: { 'Bucket Material': 'Virgin ABS & Stainless Steel wringer', 'Handle': 'Stainless steel telescopic pole with quick lock', 'Refills': '2x Microfiber high absorption mop heads', 'Crate': '10 Sets' },
        slabs: [ { slab: '10 - 49 Sets', rate: '₹450.00' }, { slab: '50 - 149 Sets', rate: '₹420.00' }, { slab: '150+ Sets', rate: '₹395.00' } ]
      }
    };

    // --- MODULE 3: DYNAMIC CATALOG CARD RENDERING ENGINE ---
    // Reads from 'productsData', filters by category, sub-filter, or in-stock status,
    // sorts according to criteria, and injects cards into #productCardGrid.
    // Handles strict retail pricing vs. wholesale factory bulk lots.
    function renderProductCards() {
      const grid = document.getElementById('productCardGrid');
      if (!grid) return;

      const isWholesale = (priceMode === 'wholesale');
      let productsList = Object.values(productsData);

      // 1. Filter by category
      if (currentFilterCat !== 'all') {
        productsList = productsList.filter(p => p.cat === currentFilterCat);
      }

      // 2. Filter by subcategory (if bottles)
      if (currentFilterCat === 'bottle' && currentFilterSub !== 'all') {
        productsList = productsList.filter(p => p.sub === currentFilterSub);
      }

      // 3. Filter by in-stock toggle
      if (inStockOnly) {
        productsList = productsList.filter(p => (stocks[p.id] || 0) > 0);
      }

      // 4. Sort catalog
      if (currentSort === 'price-asc') {
        productsList.sort((a, b) => (isWholesale ? a.wholesalePrice : a.retailPrice) - (isWholesale ? b.wholesalePrice : b.retailPrice));
      } else if (currentSort === 'price-desc') {
        productsList.sort((a, b) => (isWholesale ? b.wholesalePrice : b.retailPrice) - (isWholesale ? a.wholesalePrice : a.retailPrice));
      } else if (currentSort === 'rating') {
        productsList.sort((a, b) => b.rating - a.rating);
      } else {
        productsList.sort((a, b) => a.id - b.id);
      }

      // Update count badge
      const countEl = document.getElementById('catalogResultCountBadge');
      if (countEl) countEl.textContent = `Showing ${productsList.length} Product${productsList.length !== 1 ? 's' : ''}`;

      if (productsList.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748B;">No products match your active filters.</div>';
        return;
      }

      let html = '';
      productsList.forEach(p => {
        const curStock = stocks[p.id] !== undefined ? stocks[p.id] : 0;
        const stockBadgeClass = curStock > 50 ? 'in-stock' : (curStock > 0 ? 'low-stock' : 'out-stock');
        const stockText = curStock > 0 ? `● In Stock (${curStock})` : 'Out of Stock';

        if (isWholesale) {
          html += `
            <article class="p-card" data-cat="${p.cat}" data-sub="${p.sub}" id="card-prod-${p.id}">
              <span class="badge-deal">${p.badgeDeal}</span>
              <span class="badge-moq" id="moq-${p.id}" style="background: #DCFCE7; color: #166534;">MOQ: ${p.wholesaleMoq} Pcs</span>
              <span class="badge-stock ${stockBadgeClass}" id="stock-badge-${p.id}">${stockText}</span>
              <div class="p-img-box" onclick="openProductQuickView(${p.id})" title="Click to view full technical specs & bulk rates">
                <img src="${p.img}" alt="${p.title}" id="card-img-${p.id}" onerror="this.onerror=null; this.src='./assets/ramdev_feather_logo.jpg';">
              </div>
              <div class="p-body">
                <span class="p-category-tag">${p.catTag}</span>
                <h4 class="p-title" onclick="openProductQuickView(${p.id})" title="Click for specifications">${p.title}</h4>
                <div class="p-ratings">
                  <span class="stars">★★★★★</span>
                  <span class="rating-num">${p.rating} (${p.ratingCount} ratings)</span>
                </div>
                <div class="p-price-box">
                  <div class="price-row">
                    <span class="price-label" id="price-lbl-${p.id}" style="font-size: 0.8rem; font-weight: 700; color: #047857;">Wholesale Factory Rate:</span>
                    <span class="price-curr">₹</span>
                    <span class="price-amount" id="price-${p.id}">${p.wholesalePrice}</span>
                    <span class="price-unit" id="unit-${p.id}">${p.wholesaleUnit}</span>
                  </div>
                  <div class="wholesale-verified-bar" id="verified-bar-${p.id}">
                    <span>✅ Factory Direct Rate • Minimum Order: <strong>${p.wholesaleMoq} Pcs</strong></span>
                  </div>
                </div>
                <div class="p-delivery" id="delivery-${p.id}">${p.wholesaleDelivery}</div>
                <div class="p-actions">
                  <button class="btn-cart" id="btn-cart-${p.id}" onclick="handleAddToCart(${p.id})">Add ${p.wholesaleMoq} Pcs to Cart</button>
                  <button class="btn-buy" id="btn-buy-${p.id}" onclick="handleBuyNow(${p.id})">Order Bulk Lot (${p.wholesaleMoq} Pcs)</button>
                  <button class="btn-specs" onclick="openProductQuickView(${p.id})">🔍 Specs & Slabs</button>
                  <button class="btn-wa" onclick="inquireWhatsApp(${p.id})">💬 Inquire on WhatsApp</button>
                </div>
              </div>
            </article>
          `;
        } else {
          // Retail Mode
          html += `
            <article class="p-card" data-cat="${p.cat}" data-sub="${p.sub}" id="card-prod-${p.id}">
              <span class="badge-deal">${p.badgeDeal}</span>
              <span class="badge-moq" id="moq-${p.id}">MOQ: 1 Pc</span>
              <span class="badge-stock ${stockBadgeClass}" id="stock-badge-${p.id}">${stockText}</span>
              <div class="p-img-box" onclick="openProductQuickView(${p.id})" title="Click to view full technical specs & bulk rates">
                <img src="${p.img}" alt="${p.title}" id="card-img-${p.id}" onerror="this.onerror=null; this.src='./assets/ramdev_feather_logo.jpg';">
              </div>
              <div class="p-body">
                <span class="p-category-tag">${p.catTag}</span>
                <h4 class="p-title" onclick="openProductQuickView(${p.id})" title="Click for specifications">${p.title}</h4>
                <div class="p-ratings">
                  <span class="stars">★★★★★</span>
                  <span class="rating-num">${p.rating} (${p.ratingCount} ratings)</span>
                </div>
                <div class="p-price-box">
                  <div class="mrp-line" id="mrp-box-${p.id}">M.R.P.: <del>₹${p.retailMrp}</del></div>
                  <div class="price-row">
                    <span class="price-label" id="price-lbl-${p.id}">Retail:</span>
                    <span class="price-curr">₹</span>
                    <span class="price-amount" id="price-${p.id}">${p.retailPrice}</span>
                    <span class="price-unit" id="unit-${p.id}">${p.retailUnit}</span>
                  </div>
                  ${(getCurrentUser() && getCurrentUser().portal === 'retail') ? `
                    <div style="font-size: 0.74rem; color: #166534; font-weight: 700; margin-top: 4px; background: #DCFCE7; padding: 3px 6px; border-radius: 4px;">
                      ✔ Direct Doorstep Retail Purchase (Save ₹${p.retailMrp - p.retailPrice})
                    </div>
                  ` : `
                    <div class="wholesale-lock-bar" id="lock-bar-${p.id}">
                      <span class="lock-txt">🔒 Wholesale Rate: <strong>Locked</strong></span>
                      <button class="btn-unlock-text" onclick="requestSwitchMode('wholesale')">Verify Dealer Access</button>
                    </div>
                  `}
                </div>
                <div class="p-delivery" id="delivery-${p.id}">${p.retailDelivery}</div>
                <div class="p-actions">
                  <button class="btn-cart" id="btn-cart-${p.id}" onclick="handleAddToCart(${p.id})">Add to Cart</button>
                  <button class="btn-buy" id="btn-buy-${p.id}" onclick="handleBuyNow(${p.id})">Buy Now</button>
                  <button class="btn-specs" onclick="openProductQuickView(${p.id})">🔍 Specs & Slabs</button>
                  <button class="btn-wa" onclick="inquireWhatsApp(${p.id})">💬 Inquire on WhatsApp</button>
                </div>
              </div>
            </article>
          `;
        }
      });

      grid.innerHTML = html;
    }

    // --- MODULE 4: DUAL-PORTAL ISOLATION & DEALER VERIFICATION ENGINE ---
    // Enforces strict separation: Retail users NEVER see wholesale shift options.
    // Wholesale mode requires verified GSTIN registration.
    function isDealerVerified() {
      return localStorage.getItem('isDealerVerified') === 'true';
    }

    function getDealerProfile() {
      try { return JSON.parse(localStorage.getItem('dealerProfile')) || null; }
      catch (e) { return null; }
    }

    // --- Portal & Price Isolation (Strict Retail vs Wholesale Separation) ---
    function setPriceMode(mode) {
      const user = getCurrentUser();
      if (mode === 'wholesale') {
        if (user && user.portal === 'retail') {
          alert('You are signed in with a Retail Customer ID. Wholesale bulk pricing is strictly reserved for verified trade dealers.');
          return;
        }
        if (!isDealerVerified()) {
          openDealerVerification();
          return;
        }
      }

      priceMode = mode;
      localStorage.setItem('ramdevPortalMode', mode);
      applyCurrentUserState();
      renderProductCards();
    }

    function requestSwitchMode(mode) {
      const user = getCurrentUser();
      if (mode === 'wholesale') {
        if (user && user.portal === 'retail') {
          alert('You are signed in with a Retail Customer ID. Wholesale bulk pricing is strictly reserved for verified trade dealers.');
          return;
        }
        if (!isDealerVerified()) { openDealerVerification(); return; }
        setPriceMode('wholesale');
        showToast('🏭 Wholesale Dealer Portal Activated');
      } else {
        setPriceMode('retail');
        showToast('🛍️ Retail Customer Portal Activated');
      }
    }

    function openPortalGateway() { openModal('entryGatewayModal'); }
    function closeGatewayModal() {
      closeModal('entryGatewayModal');
      if (!localStorage.getItem('ramdevPortalMode')) setPriceMode('retail');
    }
    function selectPortal(mode) {
      closeModal('entryGatewayModal');
      requestSwitchMode(mode);
    }

    // --- Dealer Verification Multi-Step Modal ---
    function openDealerVerification() {
      document.getElementById('dealerStep1').style.display = 'block';
      document.getElementById('dealerStep2').style.display = 'none';
      document.getElementById('dealerStep3').style.display = 'none';
      openModal('dealerVerificationModal');
    }

    function autoFillSampleGstin() {
      document.getElementById('dealerFirmInput').value = 'Shree Ram Plastics & Trade';
      document.getElementById('dealerGstinInput').value = '08AABCR1234F1Z8';
      document.getElementById('dealerContactPersonInput').value = 'Rajesh Kumar';
      document.getElementById('dealerMobileInput').value = '9829012345';
      document.getElementById('dealerCityInput').value = 'Jodhpur, Rajasthan';
      showToast('Sample GSTIN details pre-filled for instant verification!');
    }

    function submitDealerVerificationStep1() {
      const firm = document.getElementById('dealerFirmInput').value.trim();
      const cat = document.getElementById('dealerCategorySelect').value;
      const proof = document.getElementById('dealerProofSelect').value;
      const gstin = document.getElementById('dealerGstinInput').value.trim();
      const person = document.getElementById('dealerContactPersonInput').value.trim();
      const mobile = document.getElementById('dealerMobileInput').value.trim();
      const city = document.getElementById('dealerCityInput').value.trim();

      if (!firm || !gstin || !person || !mobile || !city) {
        alert('Please fill all mandatory fields to verify your trade account.');
        return;
      }

      pendingDealerData = {
        firmName: firm,
        category: cat,
        proofType: proof,
        gstin: gstin.toUpperCase(),
        contactPerson: person,
        phone: mobile,
        city: city,
        verifiedAt: new Date().toLocaleDateString('en-IN')
      };

      document.getElementById('otpMobileDisplay').textContent = '+91 ' + mobile;
      document.getElementById('dealerStep1').style.display = 'none';
      document.getElementById('dealerStep2').style.display = 'block';
      showToast('📲 Verification code sent to +91 ' + mobile);
    }

    function verifyDealerOtp() {
      const otp = document.getElementById('otpBox').value.trim();
      if (!otp) { alert('Please enter the 4-digit verification code.'); return; }

      localStorage.setItem('isDealerVerified', 'true');
      localStorage.setItem('dealerProfile', JSON.stringify(pendingDealerData));

      document.getElementById('successFirmName').textContent = pendingDealerData.firmName;
      document.getElementById('dealerStep2').style.display = 'none';
      document.getElementById('dealerStep3').style.display = 'block';
    }

    function finishDealerVerification() {
      closeModal('dealerVerificationModal');
      setPriceMode('wholesale');
      showToast('🎉 Dealer Account Verified! Wholesale catalog unlocked.');
    }

    function openDealerProfileModal() {
      const profile = getDealerProfile();
      if (!profile) { openDealerVerification(); return; }
      document.getElementById('profileFirmName').textContent = profile.firmName;
      document.getElementById('profileCategory').textContent = profile.category;
      document.getElementById('profileGstin').textContent = profile.gstin;
      document.getElementById('profilePerson').textContent = profile.contactPerson;
      document.getElementById('profilePhone').textContent = '+91 ' + profile.phone;
      document.getElementById('profileCity').textContent = profile.city;
      openModal('dealerProfileModal');
    }

    function logoutDealerAccount() {
      if (confirm('Disconnect dealer account? Wholesale pricing will be locked until re-verified.')) {
        localStorage.removeItem('isDealerVerified');
        localStorage.removeItem('dealerProfile');
        localStorage.setItem('ramdevPortalMode', 'retail');
        closeModal('dealerProfileModal');
        setPriceMode('retail');
        showToast('Dealer account disconnected. Retail mode active.');
      }
    }

    // --- Toast Helper ---
    function showToast(msg) {
      const existing = document.getElementById('liveToast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'liveToast';
      toast.className = 'toast-popup';
      toast.innerHTML = `<span>🔔</span> <span>${msg}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => { if (toast) toast.remove(); }, 3500);
    }

    // --- MODULE 5: SHOPPING CART & 18% GST TAX ENGINE ---
    // Connects to #cartModal. Manages cart array, calculates 18% GST (HSN 3923),
    // updates subtotal and handles direct and WhatsApp checkouts.
    function handleAddToCart(productId) {
      if (!enforceAuthGuard()) return;
      const p = productsData[productId];
      if (!p) return;

      if (priceMode === 'wholesale') {
        if (!isDealerVerified()) { openDealerVerification(); return; }
        const existing = cart.find(i => i.id === productId && i.mode === 'wholesale');
        if (existing) existing.qty += p.wholesaleMoq;
        else {
          cart.push({ id: productId, title: p.title, price: p.wholesalePrice, img: p.img, qty: p.wholesaleMoq, unit: p.wholesaleUnit, mode: 'wholesale' });
        }
        updateCart();
        showToast(`🛒 Added ${p.wholesaleMoq} Pcs (Wholesale Bulk Lot) of ${p.title} to cart!`);
      } else {
        const existing = cart.find(i => i.id === productId && i.mode === 'retail');
        if (existing) existing.qty += 1;
        else {
          cart.push({ id: productId, title: p.title, price: p.retailPrice, img: p.img, qty: 1, unit: p.retailUnit, mode: 'retail' });
        }
        updateCart();
        showToast(`🛒 Added 1 Pc of ${p.title} to cart!`);
      }
    }

    function handleBuyNow(productId) {
      if (!enforceAuthGuard()) return;
      handleAddToCart(productId);
      openModal('cartModal');
    }

    function updateCart() {
      const count = cart.reduce((s, i) => s + i.qty, 0);
      document.getElementById('cartCountBadge').textContent = count;
      const list = document.getElementById('cartItemList');
      const footer = document.getElementById('cartFooter');

      if (cart.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #64748B; padding: 20px;">Your cart is empty.</p>';
        footer.style.display = 'none';
        return;
      }

      let netTotal = 0;
      let html = '';
      cart.forEach((i, idx) => {
        const itemTotal = i.price * i.qty;
        netTotal += itemTotal;
        const tag = i.mode === 'wholesale'
          ? '<span style="background: #ECFDF5; color: #047857; font-size: 0.7rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">WHOLESALE</span>'
          : '<span style="background: #EFF6FF; color: #1D4ED8; font-size: 0.7rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">RETAIL</span>';

        html += `
          <div style="display: flex; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
            <img src="${i.img}" style="width: 50px; height: 50px; object-fit: contain; border: 1px solid #E5E7EB; border-radius: 4px;">
            <div style="flex: 1;">
              <div style="font-size: 0.85rem; font-weight: 700;">${i.title} ${tag}</div>
              <div style="font-size: 0.78rem; color: #6B7280;">₹${i.price} x ${i.qty} = <strong>₹${itemTotal.toLocaleString('en-IN')}</strong></div>
            </div>
            <button onclick="cart.splice(${idx}, 1); updateCart();" style="color: #DC2626; border: none; background: none; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Remove</button>
          </div>
        `;
      });

      list.innerHTML = html;

      // Base Subtotal and 18% GST calculation (Inclusive)
      const baseSubtotal = Math.round(netTotal / 1.18);
      const gstAmount = netTotal - baseSubtotal;

      const baseEl = document.getElementById('cartBaseSubtotalText');
      if (baseEl) baseEl.textContent = '₹' + baseSubtotal.toLocaleString('en-IN');
      const gstEl = document.getElementById('cartGstText');
      if (gstEl) gstEl.textContent = '₹' + gstAmount.toLocaleString('en-IN');
      document.getElementById('cartSubtotalText').textContent = '₹' + netTotal.toLocaleString('en-IN');
      footer.style.display = 'block';
    }

    function clearCart() {
      if (cart.length === 0) return;
      if (confirm('Are you sure you want to clear all items from your cart?')) {
        cart = [];
        updateCart();
        showToast('🗑️ Cart cleared successfully.');
      }
    }

    function checkoutWhatsApp() {
      const user = getCurrentUser();
      if (!user || !user.verified) {
        alert('Please create and verify your account via OTP first before placing orders.');
        closeModal('cartModal');
        toggleAuth(true);
        openModal('authModal');
        return;
      }
      const dealer = getDealerProfile();
      let headerText = priceMode === 'wholesale' && dealer
        ? `*Order Type: Wholesale Bulk Trade Order*\n*Firm Name:* ${dealer.firmName}\n*GSTIN:* ${dealer.gstin}\n*Contact:* ${dealer.contactPerson} (${dealer.phone})\n*City:* ${dealer.city}\n*Account:* ${user.name} (${user.mobile})\n\n`
        : `*Order Type: Retail Customer Order*\n*Customer:* ${user.name}\n*Mobile:* ${user.mobile} (✔ Verified)\n*Email:* ${user.email}\n\n`;

      const itemsText = cart.map(i => `• ${i.title} (${i.mode.toUpperCase()}) x ${i.qty} = ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');
      const totalText = `\n\n*Total Amount:* ${document.getElementById('cartSubtotalText').textContent}`;
      const text = encodeURIComponent('Hello Ramdev Enterprise,\n\n' + headerText + 'I would like to place an order:\n' + itemsText + totalText);

      window.open('https://wa.me/?text=' + text, '_blank');
      cart = [];
      updateCart();
      closeModal('cartModal');
    }

    function inquireWhatsApp(productId) {
      const p = productsData[productId];
      if (!p) return;
      const dealer = getDealerProfile();
      let text = '';
      if (priceMode === 'wholesale' && isDealerVerified() && dealer) {
        text = encodeURIComponent(`Hello Ramdev Enterprise, I am a verified wholesale dealer (${dealer.firmName}, GST: ${dealer.gstin}). I would like to inquire about bulk ordering ${p.title} (Wholesale Rate ₹${p.wholesalePrice}, MOQ ${p.wholesaleMoq} Pcs) and stock availability.`);
      } else {
        text = encodeURIComponent(`Hello Ramdev Enterprise, I would like to inquire about ${p.title} (Retail Rate ₹${p.retailPrice}) and delivery availability.`);
      }
      window.open('https://wa.me/?text=' + text, '_blank');
    }

    // --- MODULE 6: NAVIGATION, CATEGORY FILTERING & SEARCH ENGINE ---
    // Switches between Homepage Tiles and Dedicated Category Views,
    // handles category circle clicks, subcategory chips, and debounced live search.
    function showHomePage() {
      if (!enforceAuthGuard()) return;
      const prodView = document.getElementById('categoryProductsView');
      if (prodView) prodView.style.display = 'none';

      const tiles = document.getElementById('homepageTilesSection');
      if (tiles) tiles.style.display = 'grid';
      const hero = document.getElementById('homeHeroBanner');
      if (hero) hero.style.display = 'block';

      document.querySelectorAll('.cat-pill-item').forEach(el => el.classList.remove('active'));

      const sel = document.getElementById('searchCategorySelect');
      if (sel) sel.value = 'all';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';

      currentFilterCat = 'all';
      currentFilterSub = 'all';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function filterCategory(cat) {
      currentFilterCat = cat;
      currentFilterSub = 'all';

      const prodView = document.getElementById('categoryProductsView');
      if (prodView) prodView.style.display = 'block';
      const tiles = document.getElementById('homepageTilesSection');
      if (tiles) tiles.style.display = 'none';
      const hero = document.getElementById('homeHeroBanner');
      if (hero) hero.style.display = 'none';

      document.querySelectorAll('.cat-pill-item').forEach(el => el.classList.remove('active'));
      const activePill = document.getElementById('cat-pill-' + cat);
      if (activePill) activePill.classList.add('active');

      const sel = document.getElementById('searchCategorySelect');
      if (sel) sel.value = cat;

      const chips = document.getElementById('bottleSubcatChips');
      const title = document.getElementById('catalogTitleHeading');
      const subtext = document.getElementById('catalogSubtext');
      const breadcrumb = document.getElementById('breadcrumbCurrentCat');

      document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
      const chipAll = document.getElementById('chip-all');
      if (chipAll) chipAll.classList.add('active');

      if (cat === 'bottle') {
        chips.style.display = 'flex';
        title.textContent = '📦 1. Plastic Bottles Range';
        subtext.textContent = 'Showing Standard Bottle, Threaded Bottle & Tap Dispenser Bottle with photo, price & MOQ.';
        if (breadcrumb) breadcrumb.textContent = '1. Plastic Bottles Range';
      } else if (cat === 'diesel') {
        chips.style.display = 'none';
        title.textContent = '⛽ 2. Diesel & Industrial Cans';
        subtext.textContent = 'Heavy duty 5L, 10L, 20L leak-proof diesel jerrycans with tamper seals.';
        if (breadcrumb) breadcrumb.textContent = '2. Diesel & Industrial Cans';
      } else if (cat === 'water') {
        chips.style.display = 'none';
        title.textContent = '🚰 3. Water Cool Jars & Campers';
        subtext.textContent = 'Un-breakable amber water dispensers with tap and cooling body.';
        if (breadcrumb) breadcrumb.textContent = '3. Water Cool Jars & Campers';
      } else if (cat === 'disposable') {
        chips.style.display = 'none';
        title.textContent = '🍽️ 4. Disposable Items';
        subtext.textContent = 'Food packaging boxes, disposable plastic cups, and meal trays.';
        if (breadcrumb) breadcrumb.textContent = '4. Disposable Items';
      } else if (cat === 'other') {
        chips.style.display = 'none';
        title.textContent = '🧹 5. Other Cleaning & Plastic Items';
        subtext.textContent = 'Magic spin mop sets, buckets, and household plastic tools.';
        if (breadcrumb) breadcrumb.textContent = '5. Other Cleaning Items';
      } else {
        chips.style.display = 'none';
        title.textContent = '📦 All 5 Categories Catalog';
        subtext.textContent = 'Explore our full wholesale & retail range.';
        if (breadcrumb) breadcrumb.textContent = 'All Products & Categories';
      }

      renderProductCards();
      window.scrollTo({ top: 110, behavior: 'smooth' });
    }

    function openCategoryWithSub(cat, sub) {
      filterCategory(cat);
      filterBottleSub(sub);
    }

    function filterBottleSub(sub) {
      currentFilterSub = sub;
      const prodView = document.getElementById('categoryProductsView');
      if (prodView && prodView.style.display === 'none') {
        filterCategory('bottle');
      }

      document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === 'chip-' + sub) btn.classList.add('active');
      });

      renderProductCards();
    }

    function handleSelectCategory(cat) { filterCategory(cat); }

    function searchCatalog() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      if (!q) { alert('Please enter a product name to search'); return; }

      const prodView = document.getElementById('categoryProductsView');
      if (prodView) prodView.style.display = 'block';
      const tiles = document.getElementById('homepageTilesSection');
      if (tiles) tiles.style.display = 'none';
      const hero = document.getElementById('homeHeroBanner');
      if (hero) hero.style.display = 'none';

      document.querySelectorAll('.cat-pill-item').forEach(el => el.classList.remove('active'));
      const chips = document.getElementById('bottleSubcatChips');
      if (chips) chips.style.display = 'none';

      const title = document.getElementById('catalogTitleHeading');
      const subtext = document.getElementById('catalogSubtext');
      const breadcrumb = document.getElementById('breadcrumbCurrentCat');

      title.textContent = `🔍 Search Results for: "${q}"`;
      if (breadcrumb) breadcrumb.textContent = `Search: "${q}"`;

      currentFilterCat = 'all';
      currentFilterSub = 'all';
      renderProductCards();

      // Filter rendered cards by query
      let matched = 0;
      document.querySelectorAll('.p-card').forEach(c => {
        if (c.innerText.toLowerCase().includes(q)) {
          c.style.display = 'flex';
          matched++;
        } else {
          c.style.display = 'none';
        }
      });

      subtext.textContent = `Found ${matched} product(s) matching "${q}".`;
      window.scrollTo({ top: 110, behavior: 'smooth' });
    }

    let searchTimer = null;
    function handleSearchInputLive(val) {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        if (val.trim().length > 1) searchCatalog();
      }, 400);
    }

    function toggleInStockFilter() {
      inStockOnly = !inStockOnly;
      const btn = document.getElementById('filterInStockBtn');
      if (btn) btn.classList.toggle('active', inStockOnly);
      renderProductCards();
      showToast(inStockOnly ? '📦 Filter: Showing only in-stock products' : '📦 Filter: Showing all products');
    }

    function sortCatalog(criteria) {
      currentSort = criteria;
      renderProductCards();
    }

    // --- MODULE 7: MODAL DIALOG CONTROLLERS ---
    // Opens/closes overlays by toggling the '.active' class.
    function openModal(id) {
      if (id !== 'entryGatewayModal' && id !== 'authModal') {
        if (!enforceAuthGuard()) return;
      }
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }
    function closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    }

    // --- MODULE 8: PINCODE DELIVERY & FREIGHT LOGISTICS CALCULATOR ---
    // Connects to #deliveryPincodeModal and header delivery pin button.
    // Calculates courier transit days and transport waybill hub for any 6-digit Indian PIN.
    const PIN_HUBS = {
      '342001': { loc: 'Jodhpur (Rajasthan)', courier: '1–2 Days Doorstep', bilty: 'Jaipur Golden Sangaria Bypass Hub' },
      '302001': { loc: 'Jaipur (Rajasthan)', courier: '2–3 Days Doorstep', bilty: 'TCI Express Transport Nagar Hub' },
      '110001': { loc: 'Delhi NCR', courier: '2–3 Days Doorstep', bilty: 'V-Trans Sanjay Gandhi Transport Nagar' },
      '380001': { loc: 'Ahmedabad (Gujarat)', courier: '2–3 Days Doorstep', bilty: 'SafeXpress Aslali Logistics Park' },
      '400001': { loc: 'Mumbai (Maharashtra)', courier: '3–4 Days Doorstep', bilty: 'Bombay Golden Vashi APMC Hub' }
    };

    function openDeliveryPincodeModal() {
      openModal('deliveryPincodeModal');
    }

    function checkPincodeDelivery() {
      const pin = document.getElementById('pincodeInput').value.trim();
      if (!/^\d{6}$/.test(pin)) {
        alert('Please enter a valid 6-digit Indian PIN code.');
        return;
      }

      const hub = PIN_HUBS[pin] || { loc: `Pincode ${pin} (Pan-India Consignment)`, courier: '3–5 Days Doorstep Courier', bilty: 'State Transport Waybill Hub' };
      document.getElementById('pincodeLocName').textContent = hub.loc;
      document.getElementById('pincodeResultBox').style.display = 'block';
    }

    function quickSelectPincode(pin, locName) {
      document.getElementById('pincodeInput').value = pin;
      checkPincodeDelivery();
    }

    function savePincodeSelection() {
      const pin = document.getElementById('pincodeInput').value.trim();
      const loc = document.getElementById('pincodeLocName').textContent;
      localStorage.setItem('savedDeliveryPincode', pin);
      localStorage.setItem('savedDeliveryLoc', loc);

      const headerText = document.getElementById('headerDeliveryLocationText');
      if (headerText) headerText.textContent = loc.split('(')[0].trim() + ' ' + pin;

      closeModal('deliveryPincodeModal');
      showToast(`📍 Active delivery location set to: ${loc}`);
    }

    // --- MODULE 9: PRODUCT SPECIFICATIONS & VOLUME SLABS MODAL ---
    // Connects to #productQuickViewModal. Displays complete engineering specs,
    // food-grade certifications, volume discount slabs, and quick-order buttons.
    function openProductQuickView(productId) {
      if (!enforceAuthGuard()) return;
      const p = productsData[productId];
      if (!p) return;

      document.getElementById('quickViewCatTag').textContent = p.catTag;
      document.getElementById('quickViewTitle').textContent = p.title;
      document.getElementById('quickViewImg').src = p.img;

      const curStock = stocks[productId] || 0;
      document.getElementById('quickViewStockBadge').textContent = curStock > 0 ? `● In Stock (${curStock})` : 'Out of Stock';

      const isWholesale = (priceMode === 'wholesale');
      document.getElementById('quickViewMoqBadge').textContent = isWholesale ? `MOQ: ${p.wholesaleMoq} Pcs` : 'MOQ: 1 Pc';

      const priceBox = document.getElementById('quickViewPriceBox');
      if (isWholesale) {
        priceBox.innerHTML = `
          <div style="font-size: 0.75rem; font-weight: 800; color: #047857; text-transform: uppercase;">Wholesale Direct Factory Rate</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #0F172A;">₹${p.wholesalePrice} <span style="font-size: 0.8rem; color: #64748B;">${p.wholesaleUnit}</span></div>
          <div style="font-size: 0.75rem; color: #047857; margin-top: 2px;">Minimum Order Quantity: <strong>${p.wholesaleMoq} Pcs</strong> • Transport Bilty Pallet Booking</div>
        `;
      } else {
        priceBox.innerHTML = `
          <div style="font-size: 0.75rem; color: #64748B;">M.R.P.: <del>₹${p.retailMrp}</del></div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #0F172A;">₹${p.retailPrice} <span style="font-size: 0.8rem; color: #64748B;">${p.retailUnit}</span></div>
          <div style="font-size: 0.75rem; color: #2563EB; margin-top: 2px;">Retail Single Unit Order • Courier Doorstep Delivery</div>
        `;
      }

      // Specs Table
      const specsTable = document.getElementById('quickViewSpecsTable');
      let specsHtml = '';
      for (const [k, v] of Object.entries(p.specs || {})) {
        specsHtml += `<tr><th style="width: 35%;">${k}</th><td>${v}</td></tr>`;
      }
      specsTable.innerHTML = specsHtml;

      // Slabs Table
      const slabsTable = document.getElementById('quickViewSlabsTable');
      let slabsHtml = '<thead><tr><th>Quantity Range</th><th>Discounted Unit Rate</th></tr></thead><tbody>';
      (p.slabs || []).forEach(s => {
        slabsHtml += `<tr><td>${s.slab}</td><td><strong>${s.rate}</strong></td></tr>`;
      });
      slabsHtml += '</tbody>';
      slabsTable.innerHTML = slabsHtml;

      // Action Handlers
      document.getElementById('quickViewWaBtn').onclick = () => inquireWhatsApp(productId);
      document.getElementById('quickViewAddCartBtn').onclick = () => { handleAddToCart(productId); closeModal('productQuickViewModal'); };
      document.getElementById('quickViewBuyNowBtn').onclick = () => { handleBuyNow(productId); closeModal('productQuickViewModal'); };

      openModal('productQuickViewModal');
    }

    // --- MODULE 10: GST PROFORMA INVOICE & PRINT ENGINE ---
    // Connects to #proformaInvoiceModal. Formats an official quotation / proforma
    // with 18% GST, state code 08 (Rajasthan), HSN 3923, and print / WhatsApp sharing.
    function generateProformaInvoice() {
      const user = getCurrentUser() || { name: 'Valued Customer', mobile: '9829012345', email: 'customer@ramdevplastics.com' };
      const dealer = getDealerProfile();

      document.getElementById('invNumber').textContent = '#RE-PI-2026-' + Math.floor(100 + Math.random() * 900);
      document.getElementById('invDate').textContent = new Date().toLocaleDateString('en-IN');

      if (priceMode === 'wholesale' && dealer) {
        document.getElementById('invPartyName').textContent = dealer.firmName;
        document.getElementById('invPartyGstin').textContent = 'GSTIN: ' + dealer.gstin;
        document.getElementById('invPartyContact').textContent = 'Contact: ' + dealer.contactPerson + ' (+' + dealer.phone + ')';
        document.getElementById('invPartyCity').textContent = 'Destination: ' + dealer.city;
        document.getElementById('invPortalType').textContent = 'Wholesale Bulk Trade';
      } else {
        document.getElementById('invPartyName').textContent = user.name;
        document.getElementById('invPartyGstin').textContent = 'Unregistered Retail Customer';
        document.getElementById('invPartyContact').textContent = 'Mobile: +91 ' + user.mobile;
        document.getElementById('invPartyCity').textContent = 'Destination: ' + (localStorage.getItem('savedDeliveryLoc') || 'All India Delivery');
        document.getElementById('invPortalType').textContent = 'Retail Consumer Order';
      }

      // Populate items table
      const tbody = document.getElementById('invoiceItemsTableBody');
      const items = cart.length > 0 ? cart : [
        { title: 'Standard Clear Plastic Water Bottle', price: 14, qty: 100, mode: 'wholesale' },
        { title: '20L Heavy Duty Diesel Jerrycan', price: 180, qty: 50, mode: 'wholesale' }
      ];

      let grandTotal = 0;
      let rowsHtml = '';
      items.forEach((item, idx) => {
        const itemTot = item.price * item.qty;
        grandTotal += itemTot;
        rowsHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>${item.title}</td>
            <td style="text-align: center;">3923.30</td>
            <td style="text-align: center;">${item.qty}</td>
            <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="text-align: right;">₹${itemTot.toLocaleString('en-IN')}</td>
          </tr>
        `;
      });
      tbody.innerHTML = rowsHtml;

      const baseVal = Math.round(grandTotal / 1.18);
      const cgstVal = Math.round((grandTotal - baseVal) / 2);
      const sgstVal = grandTotal - baseVal - cgstVal;

      document.getElementById('invBaseTotal').textContent = '₹' + baseVal.toLocaleString('en-IN');
      document.getElementById('invCgst').textContent = '₹' + cgstVal.toLocaleString('en-IN');
      document.getElementById('invSgst').textContent = '₹' + sgstVal.toLocaleString('en-IN');
      document.getElementById('invGrandTotal').textContent = '₹' + grandTotal.toLocaleString('en-IN');

      openModal('proformaInvoiceModal');
    }

    function shareInvoiceWhatsApp() {
      const invNum = document.getElementById('invNumber').textContent;
      const invTot = document.getElementById('invGrandTotal').textContent;
      const party = document.getElementById('invPartyName').textContent;
      const text = encodeURIComponent(`*RAMDEV ENTERPRISE - GST Proforma Invoice*\n\nInvoice: ${invNum}\nCustomer: ${party}\nAmount: ${invTot}\n\nKindly confirm quotation and dispatch approval.`);
      window.open('https://wa.me/?text=' + text, '_blank');
    }

    // --- MODULE 11: 4-STEP LIVE CONSIGNMENT TRACKER ---
    // Connects to #trackOrderModal. Updates visual progress: Placed → Packed → In Transport → Delivered.
    function performOrderTrack() {
      const val = document.getElementById('trackInput').value.trim().toUpperCase();
      if (!val) { alert('Please enter an Order ID'); return; }

      document.getElementById('trackDisplayOrderId').textContent = val;
      document.getElementById('trackResultContainer').style.display = 'block';

      // Demo tracking logic
      const stepPlaced = document.getElementById('stepPlaced');
      const stepPacked = document.getElementById('stepPacked');
      const stepDispatched = document.getElementById('stepDispatched');
      const stepDelivered = document.getElementById('stepDelivered');

      stepPlaced.className = 'timeline-step-item done';
      stepPacked.className = 'timeline-step-item done';
      stepDispatched.className = 'timeline-step-item active';
      stepDelivered.className = 'timeline-step-item';

      document.getElementById('trackCarrier').textContent = 'Jaipur Golden Transport Co.';
      document.getElementById('trackWaybill').textContent = '#JP-' + Math.floor(10000 + Math.random() * 90000);
      showToast('🚚 Real-time order dispatch status loaded');
    }

    // --- MODULE 12: USER AUTHENTICATION & DUAL OTP VERIFICATION ---
    // Connects to #authModal and #userAccountModal. Validates 10-digit mobile (6-9)
    // and standard email live, issues simulated dual OTPs (4819 / 9352), and manages sessions.
    function validatePhoneLive(input, hintId) {
      const hint = document.getElementById(hintId);
      let val = input.value.replace(/\D/g, '');
      input.value = val;

      if (!val) {
        input.classList.remove('is-valid', 'has-error');
        if (hint) hint.textContent = '';
        return false;
      }
      if (val.length === 10 && PHONE_REGEX.test(val)) {
        input.classList.remove('has-error');
        input.classList.add('is-valid');
        if (hint) { hint.className = 'validation-hint success'; hint.textContent = '✔ Valid 10-digit mobile number.'; }
        return true;
      } else {
        input.classList.add('has-error');
        input.classList.remove('is-valid');
        if (hint) { hint.className = 'validation-hint error'; hint.textContent = '❌ Wrong Mobile: Enter 10 digits starting with 6-9.'; }
        return false;
      }
    }

    function validateEmailLive(input, hintId) {
      const hint = document.getElementById(hintId);
      const val = input.value.trim();

      if (!val) {
        input.classList.remove('is-valid', 'has-error');
        if (hint) hint.textContent = '';
        return false;
      }

      // Check disposable / temporary email domains
      if (isDisposableEmail(val)) {
        input.classList.add('has-error');
        input.classList.remove('is-valid');
        if (hint) {
          hint.className = 'validation-hint error';
          hint.textContent = '❌ Disposable/temporary emails are not allowed. Please enter a permanent email address (e.g. Gmail, Outlook, Yahoo).';
        }
        return false;
      }

      if (EMAIL_REGEX.test(val)) {
        input.classList.remove('has-error');
        input.classList.add('is-valid');
        if (hint) { hint.className = 'validation-hint success'; hint.textContent = '✔ Valid email format.'; }
        return true;
      } else {
        input.classList.add('has-error');
        input.classList.remove('is-valid');
        if (hint) { hint.className = 'validation-hint error'; hint.textContent = '❌ Wrong Email: Enter a valid address (name@example.com).'; }
        return false;
      }
    }

    function validateLoginInputLive(input) {
      const hint = document.getElementById('loginFormatHint');
      const val = input.value.trim();
      const alertBox = document.getElementById('loginErrorAlert');
      if (alertBox) alertBox.style.display = 'none';

      if (!val) {
        input.classList.remove('is-valid', 'has-error');
        if (hint) hint.textContent = '';
        return false;
      }
      if (/^\d+$/.test(val)) {
        return validatePhoneLive(input, 'loginFormatHint');
      } else {
        return validateEmailLive(input, 'loginFormatHint');
      }
    }

    // --- Auth Management ---
    function autoFillValidSignupData() {
      document.getElementById('regName').value = 'Ramesh Sharma';
      const phoneInput = document.getElementById('regPhone');
      phoneInput.value = '9829012345';
      validatePhoneLive(phoneInput, 'phoneErrorHint');

      const emailInput = document.getElementById('regEmail');
      emailInput.value = 'ramesh.sharma@example.com';
      validateEmailLive(emailInput, 'emailErrorHint');

      document.getElementById('regPass').value = 'secure123';
      showToast('⚡ Pre-filled valid test details for instant verification!');
    }

    function autoFillBothOtps() {
      document.getElementById('signupMobileOtp').value = EXPECTED_MOBILE_OTP;
      document.getElementById('signupEmailOtp').value = EXPECTED_EMAIL_OTP;
      document.getElementById('mobileOtpError').textContent = '';
      document.getElementById('emailOtpError').textContent = '';
      showToast(`⚡ Pre-filled demo OTPs: ${EXPECTED_MOBILE_OTP} & ${EXPECTED_EMAIL_OTP}`);
    }

    function quickFillDemoLogin() {
      const loginInp = document.getElementById('loginInput');
      loginInp.value = '9829012345';
      validateLoginInputLive(loginInp);
      document.getElementById('loginPass').value = '123';
      showToast('⚡ Quick filled demo user credentials!');
    }

    function toggleAuth(isSignUp) {
      document.getElementById('loginView').style.display = isSignUp ? 'none' : 'block';
      document.getElementById('signupView').style.display = isSignUp ? 'block' : 'none';
      document.getElementById('dualOtpView').style.display = 'none';
      document.getElementById('authSuccessView').style.display = 'none';
      document.getElementById('authTitle').textContent = isSignUp ? '📝 Create Account (OTP Verification)' : '🔑 Sign In';
    }

    function getCurrentUser() {
      try { return JSON.parse(localStorage.getItem('currentUser')) || null; }
      catch (e) { return null; }
    }
    window.getCurrentUser = getCurrentUser;

    function handleAccountHeaderClick() {
      const user = getCurrentUser();
      const isSessionActive = sessionStorage.getItem('ramdevSessionActive') === 'true';
      if (user && user.verified && isSessionActive) {
        openUserAccountModal();
      } else {
        if (window.enforceAuthGuard) window.enforceAuthGuard();
      }
    }

    function openUserAccountModal() {
      if (window.enforceAuthGuard && !window.enforceAuthGuard()) return;
      const user = getCurrentUser();
      if (!user) return;
      const nameEl = document.getElementById('userAccName');
      const initEl = document.getElementById('userInitialChar');
      const phoneEl = document.getElementById('userAccPhone');
      const emailEl = document.getElementById('userAccEmail');
      const portalEl = document.getElementById('userAccPortal');
      if (nameEl) nameEl.textContent = user.name;
      if (initEl) initEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
      if (phoneEl) phoneEl.textContent = user.mobile && user.mobile.startsWith('+') ? user.mobile : '+91 ' + (user.mobile || '9829012345');
      if (emailEl) emailEl.textContent = user.email;
      if (portalEl) portalEl.textContent = (priceMode === 'wholesale') ? 'Wholesale Dealer' : 'Retail Customer';
      openModal('userAccountModal');
    }

    function applyCurrentUserState() {
      const user = getCurrentUser();
      const greetingEl = document.getElementById('userGreeting');
      const portalBox = document.getElementById('headerPortalModeBox');
      const retailBadge = document.getElementById('headerRetailBadge');
      const dealerBadge = document.getElementById('headerDealerBadge');
      const dealerProfile = getDealerProfile();

      if (user && user.verified) {
        greetingEl.innerHTML = `Hello, <strong>${user.name}</strong> <span style="color: #4ADE80; font-size: 0.75rem;">✔</span>`;
      } else {
        greetingEl.textContent = 'Hello, Sign In';
      }

      // STRICT HOMEPAGE SEPARATION:
      // If user is a Retail customer, HIDE the wholesale switch option completely from the header!
      const isRetailUser = (user && user.portal === 'retail') || (!user && localStorage.getItem('ramdevPortalMode') === 'retail');
      const isWholesaleVerified = (user && user.portal === 'wholesale') || isDealerVerified();

      if (isRetailUser) {
        if (portalBox) portalBox.style.display = 'none'; // Hide wholesale shift toggle & switch button
        if (dealerBadge) dealerBadge.style.display = 'none';
        if (retailBadge) retailBadge.style.display = 'flex'; // Show clean Retail Customer Store badge
        priceMode = 'retail';
      } else if (isWholesaleVerified) {
        if (portalBox) portalBox.style.display = 'none';
        if (retailBadge) retailBadge.style.display = 'none';
        if (dealerBadge) {
          dealerBadge.style.display = 'flex';
          if (dealerProfile) {
            document.getElementById('headerFirmName').textContent = dealerProfile.firmName || 'Verified Dealer';
            document.getElementById('headerGstin').textContent = dealerProfile.gstin || 'GSTIN Active';
          }
        }
        priceMode = 'wholesale';
      } else {
        // First-time guest visitor before making a selection
        if (portalBox) portalBox.style.display = 'flex';
        if (retailBadge) retailBadge.style.display = 'none';
        if (dealerBadge) dealerBadge.style.display = 'none';
      }
    }

    function handleCheckoutOrder() {
      const user = getCurrentUser();
      if (!user || !user.verified) {
        alert('Please create and verify your account first before ordering.');
        closeModal('cartModal');
        toggleAuth(true);
        openModal('authModal');
        return;
      }
      const orderId = '#RE-' + Math.floor(100000 + Math.random() * 900000);
      alert(`Order placed successfully!\n\nOrder ID: ${orderId}\nCustomer: ${user.name}\nDispatch Confirmed.`);
      cart = [];
      updateCart();
      closeModal('cartModal');
    }

    // --- MODULE 14: SYSTEM BOOTSTRAP & INITIALIZATION ---
    // Bootstraps application on DOMContentLoaded. Checks saved credentials,
    // sets active delivery pin, enforces portal isolation, and launches storefront.
    function initPortalGate() {
      // Check saved delivery location
      const savedPin = localStorage.getItem('savedDeliveryPincode');
      const savedLoc = localStorage.getItem('savedDeliveryLoc');
      if (savedPin && savedLoc) {
        const headerText = document.getElementById('headerDeliveryLocationText');
        if (headerText) headerText.textContent = savedLoc.split('(')[0].trim() + ' ' + savedPin;
      }

      const isSessionActive = sessionStorage.getItem('ramdevSessionActive') === 'true';
      const user = getCurrentUser();

      if (isSessionActive && user && user.verified) {
        enterStorefront(user.portal || 'retail');
      } else {
        document.getElementById('entryAuthGateScreen').style.display = 'flex';
        document.getElementById('mainStorefrontApp').style.display = 'none';
        showGateLoginView();
      }
    }

    // Single Clean Bootstrap on DOM Load (Strictly Guards Unauthenticated Users)
    document.addEventListener('DOMContentLoaded', () => {
      initPortalGate();
    });
