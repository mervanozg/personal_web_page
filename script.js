document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const links = document.querySelectorAll('a[href^="#"]');
    
    for (let link of links) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Navbar yüksekliğini hesaba katmak için scroll offset
                const headerOffset = 100; 
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // FIX: Add animation on scroll (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' 
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Sadece 'animate-in' sınıfını ekleyerek CSS animasyonunu tetikle
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Animasyon 1 kez çalışsın
            }
        });
    }, observerOptions);

    // Observe all relevant elements
    const elementsToAnimate = document.querySelectorAll('.info-card, .about-card, .learning-card, .step-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
    // Add hover effects to table rows
    const tableRows = document.querySelectorAll('.tech-table tr');
    tableRows.forEach(row => {
        row.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.01)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });

    // Typewriter effect for hero title & subtitle
    function typeWriter(element, text, speed = 100, callback) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    if (heroTitle && heroSubtitle) {
        const originalTitleText = heroTitle.textContent;
        const originalSubtitleText = heroSubtitle.textContent;

        heroTitle.textContent = '';
        heroSubtitle.textContent = '';

        typeWriter(heroTitle, originalTitleText, 80, () => {
             setTimeout(() => {
                 typeWriter(heroSubtitle, originalSubtitleText, 50);
             }, 500);
        });
    }
    
    // Ripple effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            const existingRipple = this.querySelector('.ripple');
            if (existingRipple) existingRipple.remove();

            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add PARALLAX effect to background elements & toggle scroll-down hint
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card, .floating-product, .hero-image');
    
    parallaxElements.forEach(element => {
        const speed = element.classList.contains('hero-image') ? 0.2 : 0.4;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });

    const scrollHints = document.querySelectorAll('.scroll-down-hint');
    scrollHints.forEach(hint => {
        if (scrolled > 250) {
            hint.classList.add('hidden-hint');
        } else {
            hint.classList.remove('hidden-hint');
        }
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
// Global Sales Map (OpenLayers) - Solves Issue 1 (Zoom Threshold) & Issue 2 (Earth Repeating)
function initSalesMap() {
    const OL_ZOOM_THRESHOLD = 3.5;

    const salesData = [
        { country: "USA - New York", sales: 32, coords: [-74.0060, 40.7128] },
        { country: "USA - Los Angeles", sales: 24, coords: [-118.2437, 34.0522] },
        { country: "USA - Chicago", sales: 18, coords: [-87.6298, 41.8781] },
        { country: "USA - Houston", sales: 14, coords: [-95.3698, 29.7604] },
        { country: "Germany - Berlin", sales: 1, coords: [13.4050, 52.5200] },
        { country: "Germany - Munich", sales: 1, coords: [11.5820, 48.1351] },
        { country: "Spain - Madrid", sales: 1, coords: [-3.7038, 40.4168] },
        { country: "Spain - Valencia", sales: 1, coords: [-0.3763, 39.4699] },
        { country: "Italy - Rome", sales: 1, coords: [12.4964, 41.9028] },
        { country: "China - Shanghai", sales: 1, coords: [121.4737, 31.2304] }
    ];

    // Issue 2 Solution: wrapX: false in OSM source + multiWorld: false and extent in View
    const worldExtent = ol.proj.get('EPSG:3857').getExtent();

    const map = new ol.Map({
        target: 'salesMap',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM({
                    url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
                    wrapX: false,
                    crossOrigin: null,
                    attributions: ['© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors']
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-20, 35]),
            zoom: 2,
            minZoom: 2,
            maxZoom: 14,
            multiWorld: false,
            extent: worldExtent
        })
    });

    const markerElements = [];

    // Sales markers
    salesData.forEach(data => {
        const el = document.createElement('div');
        el.className = 'map-marker';
        el.innerHTML = data.sales;
        el.title = `${data.country}: ${data.sales} sales`;

        const size = 32 + (data.sales * 0.45);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.fontSize = `${0.75 + (data.sales * 0.008)}rem`;

        if (data.sales >= 20) {
            el.style.background = 'var(--accent)';
            el.style.color = '#171717';
        }

        const marker = new ol.Overlay({
            position: ol.proj.fromLonLat(data.coords),
            positioning: 'center-center',
            element: el,
            stopEvent: false
        });

        map.addOverlay(marker);
        markerElements.push(el);
    });

    const zoomStatusEl = document.getElementById('olZoomStatus');
    const zoomBannerEl = document.getElementById('olZoomBanner');
    const zoomBtnEl = document.getElementById('olZoomBtn');

    // Issue 1 Solution: Show markers only when zoom >= OL_ZOOM_THRESHOLD
    function updateOlMarkersVisibility() {
        const currentZoom = map.getView().getZoom() || 2;
        const isVisible = currentZoom >= OL_ZOOM_THRESHOLD;

        markerElements.forEach(el => {
            el.style.display = isVisible ? 'flex' : 'none';
        });

        if (zoomStatusEl && zoomBannerEl) {
            if (isVisible) {
                zoomStatusEl.textContent = `Current Zoom: ${currentZoom.toFixed(1)} | Threshold: ${OL_ZOOM_THRESHOLD} — Markers are VISIBLE (Zoom out < ${OL_ZOOM_THRESHOLD} to hide overlapping markers)`;
                zoomBannerEl.classList.add('threshold-reached');
                if (zoomBtnEl) zoomBtnEl.textContent = 'Zoom Out (Hide Markers)';
            } else {
                zoomStatusEl.textContent = `Current Zoom: ${currentZoom.toFixed(1)} | Threshold: ${OL_ZOOM_THRESHOLD} — Markers HIDDEN to prevent overlap. Zoom in (≥ ${OL_ZOOM_THRESHOLD}) to view!`;
                zoomBannerEl.classList.remove('threshold-reached');
                if (zoomBtnEl) zoomBtnEl.textContent = 'Zoom to Markers';
            }
        }
    }

    map.getView().on('change:resolution', updateOlMarkersVisibility);
    updateOlMarkersVisibility();

    if (zoomBtnEl) {
        zoomBtnEl.addEventListener('click', function() {
            const currentZoom = map.getView().getZoom() || 2;
            const targetZoom = currentZoom >= OL_ZOOM_THRESHOLD ? 2 : 4;
            map.getView().animate({
                zoom: targetZoom,
                duration: 600
            });
        });
    }
}

// Academic & Geospatial Journey Map (Leaflet) - Solves Issue 1 (Zoom Threshold) & Issue 2 (Earth Repeating)
function initJourneyMap() {
    if (typeof L === 'undefined') return;

    const LEAFLET_ZOOM_THRESHOLD = 5;
    const southWest = L.latLng(-85, -180);
    const northEast = L.latLng(85, 180);
    const worldBounds = L.latLngBounds(southWest, northEast);

    // Issue 2 Solution: maxBounds, maxBoundsViscosity, minZoom, and noWrap: true on tileLayer
    const map = L.map('journeyMap', {
        center: [40.0, 18.0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0,
        worldCopyJump: false
    });

    const osmDeLayer = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true,
        bounds: worldBounds
    });

    const osmHotLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>',
        subdomains: 'abc',
        noWrap: true,
        bounds: worldBounds
    });

    osmDeLayer.addTo(map);
    L.control.layers({
        "OpenStreetMap Standard": osmDeLayer,
        "OpenStreetMap Humanitarian": osmHotLayer
    }).addTo(map);

    const journeyLocations = [
        {
            title: "Hacettepe University - Geomatics Engineering",
            location: "Beytepe Campus, Ankara, Turkey",
            description: "B.Sc. in Geomatics Engineering — GIS, Photogrammetry & Remote Sensing studies.",
            coords: [39.8675, 32.7344]
        },
        {
            title: "TED Polatlı College",
            location: "Polatlı, Ankara, Turkey",
            description: "Completed primary and secondary education.",
            coords: [39.5842, 32.1462]
        },
        {
            title: "Gordion Ancient City 3D Digital Twin Project (HKMO)",
            location: "Yassıhöyük, Polatlı, Ankara, Turkey",
            description: "Actively participated in field surveys, assisted with GPS measurements, and observed UAV (drone) imagery acquisition and indoor museum LiDAR scanning. <br><a href='https://dijitalikiz.hkmo.org.tr/' target='_blank'>🔗 dijitalikiz.hkmo.org.tr</a>",
            coords: [39.6503, 31.9942]
        },
        {
            title: "HKMO Software Camp & BTK Web GIS",
            location: "Çankaya, Ankara, Turkey",
            description: "HKMO 2nd Software Camp Achievement Certificate & Web-Based GIS Certification.",
            coords: [39.9199, 32.8543]
        },
        {
            title: "35th IGSM Presentation: Emergency & Disaster Gathering Areas Web GIS",
            location: "Universitat Politècnica de València, Valencia, Spain",
            description: "Presentation titled 'İzmir Province Emergency and Disaster Gathering Areas Web Application' at the 35th IGSM.",
            coords: [39.4816, -0.3428]
        },
        {
            title: "36th International Geodetic Student Meeting (IGSM)",
            location: "Sofia, Bulgaria",
            description: "International Geodetic Student Meeting participation.",
            coords: [42.6977, 23.3219]
        },
        {
            title: "35th International Geodetic Student Meeting (IGSM)",
            location: "Valencia, Spain",
            description: "35th International Geodetic Student Meeting participation in Valencia, Spain.",
            coords: [39.4699, -0.3763]
        }
    ];

    const markerLayer = L.layerGroup();

    journeyLocations.forEach(item => {
        const marker = L.marker(item.coords);
        marker.bindPopup(
            `<strong>${item.title}</strong><br>` +
            `<em>📍 ${item.location}</em><br>` +
            `<span>${item.description}</span>`
        );
        markerLayer.addLayer(marker);
    });

    const zoomStatusEl = document.getElementById('leafletZoomStatus');
    const zoomBannerEl = document.getElementById('leafletZoomBanner');
    const zoomBtnEl = document.getElementById('leafletZoomBtn');

    // Issue 1 Solution: Only display markerLayer when zoom >= LEAFLET_ZOOM_THRESHOLD
    function updateLeafletMarkers() {
        const currentZoom = map.getZoom();
        const isVisible = currentZoom >= LEAFLET_ZOOM_THRESHOLD;

        if (isVisible) {
            if (!map.hasLayer(markerLayer)) {
                map.addLayer(markerLayer);
            }
        } else {
            if (map.hasLayer(markerLayer)) {
                map.removeLayer(markerLayer);
            }
        }

        if (zoomStatusEl && zoomBannerEl) {
            if (isVisible) {
                zoomStatusEl.textContent = `Current Zoom: ${currentZoom} | Threshold: ${LEAFLET_ZOOM_THRESHOLD} — Markers are VISIBLE (Click any marker for details, or zoom out < ${LEAFLET_ZOOM_THRESHOLD} to hide)`;
                zoomBannerEl.classList.add('threshold-reached');
                if (zoomBtnEl) zoomBtnEl.textContent = 'Zoom Out (Hide Markers)';
            } else {
                zoomStatusEl.textContent = `Current Zoom: ${currentZoom} | Threshold: ${LEAFLET_ZOOM_THRESHOLD} — Markers HIDDEN to prevent overlap in Ankara/Europe. Zoom in (≥ ${LEAFLET_ZOOM_THRESHOLD}) to view!`;
                zoomBannerEl.classList.remove('threshold-reached');
                if (zoomBtnEl) zoomBtnEl.textContent = 'Zoom to Markers';
            }
        }
    }

    map.on('zoomend', updateLeafletMarkers);
    updateLeafletMarkers();

    if (zoomBtnEl) {
        zoomBtnEl.addEventListener('click', function() {
            const currentZoom = map.getZoom();
            if (currentZoom >= LEAFLET_ZOOM_THRESHOLD) {
                map.setView([40.0, 16.0], 3, { animate: true });
            } else {
                map.setView([40.5, 16.0], 5, { animate: true });
            }
        });
    }
}

// Sayfa yüklendiğinde haritaları başlat
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('salesMap')) {
        initSalesMap();
    }
    if (document.getElementById('journeyMap')) {
        initJourneyMap();
    }
});