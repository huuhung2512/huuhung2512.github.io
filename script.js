// Sound Effects (Optional - mocked for now)
const clickSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='); // Placeholder

// --- CAT GAME VARIABLES ---
const catContainer = document.getElementById('cat-container');
let cats = [];
let giantCat = null;
const MAX_CATS = 10;
const BOUNCE_DAMPING = 0.8;

// Cat Assets
const catImages = [
    'Asset/Art/cat1.png',
    'Asset/Art/cat2.png',
    'Asset/Art/cat3.png',
    'Asset/Art/cat4.png',
    'Asset/Art/cat5.png',
    'Asset/Art/cat6.png'
];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // Wait for user interaction to start everything
    const startScreen = document.getElementById('start-screen');
    startScreen.addEventListener('click', () => {
        startScreen.style.opacity = '0';
        setTimeout(() => startScreen.style.display = 'none', 500);

        // Play BGM
        const bgm = document.getElementById('bgm');
        if (bgm) {
            bgm.volume = 0.5;
            bgm.play().catch(e => console.log("Audio play failed:", e));
        }

        // Start Profile Features
        initProfile();
    });

    // BGM Toggle
    const bgmToggle = document.getElementById('bgm-toggle');
    const bgm = document.getElementById('bgm');

    bgmToggle.addEventListener('click', () => {
        if (bgm.paused) {
            bgm.play();
            bgmToggle.innerHTML = '<i class="fas fa-volume-up"></i> MUSIC: ON';
            bgmToggle.classList.remove('muted');
        } else {
            bgm.pause();
            bgmToggle.innerHTML = '<i class="fas fa-volume-mute"></i> MUSIC: OFF';
            bgmToggle.classList.add('muted');
        }
    });
});

function initProfile() {
    // Clear initial text and start typing
    document.getElementById('typewriter-text').innerHTML = '';
    typeWriter();

    // Load Profile & Games
    fetchProfile();

    // Spawn First Cat
    spawnCat(window.innerWidth / 2, window.innerHeight / 2);

    // Start Game Loop
    requestAnimationFrame(gameLoop);
}

// Sound Effects
const catchSound = new Audio('Asset/Sound/Sound/catch.mp3');
const bossMusic = new Audio('Asset/Sound/Sound/catBoss.mp3');
bossMusic.loop = true;

// --- CAT LOGIC ---
class Cat {
    constructor(x, y, isGiant = false) {
        this.element = document.createElement('div');
        this.element.classList.add('pixel-cat');
        this.isGiant = isGiant;

        if (this.isGiant) {
            this.element.classList.add('giant-cat');
            this.size = 200; // Bigger hit box for boss
            this.clicks = 0;
        } else {
            this.size = 80;
            // Random Image from Array
            const randomImg = catImages[Math.floor(Math.random() * catImages.length)];
            this.element.style.backgroundImage = `url('${randomImg}')`;
        }

        this.x = x - this.size / 2;
        this.y = y - this.size / 2;
        this.vx = (Math.random() - 0.5) * 4; // Random velocity
        this.vy = (Math.random() - 0.5) * 4;

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        // Click Handler
        this.element.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Don't trigger other clicks
            this.handleClick();
        });

        catContainer.appendChild(this.element);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x <= 0 || this.x >= window.innerWidth - this.size) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(this.x, window.innerWidth - this.size));
        }
        if (this.y <= 0 || this.y >= window.innerHeight - this.size) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(this.y, window.innerHeight - this.size));
        }

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    handleClick() {
        // Play Sound (Clone to allow overlapping sounds)
        const sound = catchSound.cloneNode();
        sound.volume = 0.5;
        sound.play().catch(e => console.log("Sound play failed:", e));

        if (this.isGiant) {
            this.grow();
        } else {
            this.split();
        }
    }

    split() {
        // Remove self
        this.element.remove();
        cats = cats.filter(c => c !== this);

        // Spawn 2 new cats
        spawnCat(this.x + this.size / 2, this.y + this.size / 2);
        spawnCat(this.x + this.size / 2, this.y + this.size / 2);

        checkMergeCondition();
    }

    grow() {
        this.clicks++;
        let newScale = 1 + (this.clicks * 0.2);
        this.element.style.transform = `scale(${newScale})`;

        // Explosion Threshold
        if (this.clicks >= 5) {
            this.explode();
        }
    }

    explode() {
        // Visual Explosion
        createExplosion(this.x + this.size / 2, this.y + this.size / 2);

        // Stop Boss Music & Resume BGM
        bossMusic.pause();
        bossMusic.currentTime = 0;
        const bgm = document.getElementById('bgm');
        if (bgm && !bgm.paused) bgm.play().catch(() => { }); // Only resume if it was supposed to be playing
        else if (bgm) bgm.play().catch(() => { });

        // Remove Giant Cat
        this.element.remove();
        giantCat = null;

        // Reset Game Loop -> Spawn 1 small cat
        setTimeout(() => {
            spawnCat(window.innerWidth / 2, window.innerHeight / 2);
        }, 1000);
    }
}

function spawnCat(x, y) {
    if (giantCat) return; // Don't spawn small cats if Giant Cat exists
    const cat = new Cat(x, y);
    cats.push(cat);
}

function checkMergeCondition() {
    if (cats.length >= MAX_CATS) {
        // Merge!
        setTimeout(() => {
            // Remove all small cats
            cats.forEach(c => {
                createExplosion(c.x, c.y, false); // Small poof
                c.element.remove();
            });
            cats = [];

            // Play Boss Music
            const bgm = document.getElementById('bgm');
            if (bgm) bgm.pause();
            bossMusic.volume = 0.5;
            bossMusic.play().catch(e => console.log("Boss music failed:", e));

            // Spawn Giant Cat
            giantCat = new Cat(window.innerWidth / 2, window.innerHeight / 2, true);
        }, 500);
    }
}

function createExplosion(x, y, big = true) {
    const count = big ? 50 : 10;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');

        // Random direction for explosion
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * (big ? 200 : 50);
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        if (!big) particle.style.background = 'var(--neon-blue)';

        catContainer.appendChild(particle);

        // Cleanup
        setTimeout(() => particle.remove(), 800);
    }
}

function gameLoop() {
    cats.forEach(cat => cat.update());
    if (giantCat) giantCat.update();
    requestAnimationFrame(gameLoop);
}


// Typing Effect for Bio
let text = "Initializing..."; // Will be overwritten by profileData.bio
const typeWriterElement = document.getElementById('typewriter-text');
let i = 0;

function typeWriter() {
    if (i < text.length) {
        if (text.charAt(i) === '\n') {
            typeWriterElement.innerHTML += '<br>';
        } else {
            typeWriterElement.innerHTML += text.charAt(i);
        }
        i++;
        setTimeout(typeWriter, 50);
    }
}

// --- EXISTING FUNCTIONS (Dynamic Game Loading etc.) ---
// --- PROFILE DATA (Centralized Config) ---
const profileData = {
    identity: {
        name: "HUUHUNG",
        level: 99,
        class: "UNITY WIZARD",
        avatar: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Gamer"
    },
    stats: {
        hp: 85, // out of 100
        xp: 45  // out of 100
    },
    bio: "Initializing dev profile...\nSubject: Huu Hung\nMission: Create epic games.\nStatus: Ready to deploy.",
    socials: [
        { label: "GITHUB", link: "#", icon: "fab fa-github" },
        { label: "ITCH.IO", link: "#", icon: "fab fa-itch-io" },
        { label: "DISCORD", link: "#", icon: "fab fa-discord" }
        // Add more buttons here: { label: "FACEBOOK", link: "...", icon: "fab fa-facebook" }
    ],
    abilities: [
        { name: "UNITY ENGINE", proficiency: 5 }, // 1 to 5
        { name: "C# SCRIPTING", proficiency: 4 },
        { name: "GAME DESIGN", proficiency: 3 },
        { name: "SHADER GRAPH", proficiency: 4 },
        { name: "BLENDER", proficiency: 1 }
    ],
    games: [
        {
            "title": "PEIH NAUT",
            "genre": "HORROR",
            "category": "3D",
            "orientation": "landscape",
            "image": "Asset/Art/thumail_Peih Nuat.png", // User provided
            "video": "Asset/Video/peihnaut_gameplay.mp4",
            "url": "https://itch.io/embed-upload/11431346?color=767a68",
            "width": 1024,
            "height": 740
        },
        {
            "title": "DREAM FANTASY",
            "genre": "RPG",
            "category": "2D",
            "orientation": "landscape",
            "image": "Asset/Art/thumail_DreamFantasy.png", // User provided
            "video": "Asset/Video/dreamfantasy_gameplay.mp4",
            "url": "https://itch.io/embed-upload/13612583?color=333333",
            "width": 1080,
            "height": 740
        },
        {
            "title": "DOGEMASTER V2",
            "genre": "ACTION",
            "category": "2D",
            "orientation": "portrait",
            "image": "Asset/Art/thumail_DodgeMaster.png", // User provided
            "video": "Asset/Video/dogemaster_gameplay.mp4",
            "url": "https://itch.io/embed-upload/13593577?color=333333",
            "width": 440,
            "height": 570
        }
    ]
};

// Sound Effects (Defined at top)

function fetchProfile() {
    // Attempt to load from JSON, fallback to JS const
    // For now, since user is largely local, we default to the JS const for reliability
    // but we can extend this to try fetch('profile.json') later.
    renderProfile(profileData);
}

function renderProfile(data) {
    // 1. Identity
    const nameEl = document.getElementById('profile-name');
    if (nameEl) {
        nameEl.textContent = data.identity.name;
        nameEl.setAttribute('data-text', data.identity.name);
    }

    const lvlEl = document.getElementById('profile-level');
    if (lvlEl) lvlEl.textContent = `LVL ${data.identity.level}`;

    const classEl = document.getElementById('profile-class');
    if (classEl) classEl.textContent = `CLASS: ${data.identity.class}`;

    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) avatarEl.src = data.identity.avatar;

    // 2. Stats
    const hpFill = document.querySelector('.hp-fill');
    if (hpFill) hpFill.style.width = `${data.stats.hp}%`;

    const xpFill = document.querySelector('.xp-fill');
    if (xpFill) xpFill.style.width = `${data.stats.xp}%`;

    // 3. Bio
    // Reset bio text for typewriter to consume
    text = data.bio;

    // 4. Social Buttons
    const socialContainer = document.getElementById('social-container');
    if (socialContainer) {
        // Keep the BGM toggle, clear the rest
        const bgmBtn = document.getElementById('bgm-toggle');
        socialContainer.innerHTML = '';
        if (bgmBtn) socialContainer.appendChild(bgmBtn); // Add back BGM button

        data.socials.forEach(btn => {
            const a = document.createElement('a');
            a.href = btn.link;
            a.className = 'hud-btn';
            a.innerHTML = `<i class="${btn.icon}"></i> ${btn.label}`;
            socialContainer.appendChild(a);
        });
    }

    // 5. Abilities
    const abilityList = document.getElementById('ability-list');
    if (abilityList) {
        abilityList.innerHTML = '';
        data.abilities.forEach(skill => {
            const li = document.createElement('li');
            li.className = 'skill-item';

            let dotsHtml = '';
            const max = 5;
            for (let i = 0; i < max; i++) {
                if (i < skill.proficiency) {
                    dotsHtml += '<i class="fas fa-square-full filled"></i>';
                } else {
                    dotsHtml += '<i class="fas fa-square-full"></i>';
                }
            }

            li.innerHTML = `
                <span class="skill-name">${skill.name}</span>
                <div class="skill-dots">${dotsHtml}</div>
            `;
            abilityList.appendChild(li);
        });
    }

    // 6. Games (Grouped)
    renderGames(data.games);
}

function renderGames(games) {
    const gamesWrapper = document.querySelector('.games-wrapper');
    if (!gamesWrapper) return;

    gamesWrapper.innerHTML = ''; // Clear

    // Group by Category
    const categories = {
        "3D GAMES": games.filter(g => g.category === "3D"),
        "2D GAMES": games.filter(g => g.category === "2D")
        // Add "OTHER" if needed for games without category
    };

    for (const [categoryName, categoryGames] of Object.entries(categories)) {
        if (categoryGames.length === 0) continue;

        // Section Title
        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'game-section-title';
        sectionTitle.innerText = `> ${categoryName}`;
        gamesWrapper.appendChild(sectionTitle);

        // Section Grid
        const grid = document.createElement('div');
        grid.className = 'game-grid-section';

        categoryGames.forEach(game => {
            const cartridge = document.createElement('div');
            cartridge.className = `game-cartridge ${game.orientation || 'landscape'}`;
            cartridge.onclick = () => openItchGame(game.url, game.title, game.width, game.height);

            const videoHtml = game.video ?
                `<video class="cartridge-video" src="${game.video}" loop muted playsinline poster="${game.image}"></video>` : '';

            cartridge.innerHTML = `
                <div class="cartridge-label">
                    <div class="cartridge-art" style="background-image: url('${game.image}');">
                        ${videoHtml}
                    </div>
                    <div class="cartridge-title">${game.title.toUpperCase()}</div>
                    <div class="cartridge-meta">GENRE: ${game.genre}</div>
                </div>
                <div class="play-indicator">PRESS START</div>
            `;

            // Hover Video
            const videoEl = cartridge.querySelector('video');
            if (videoEl) {
                cartridge.addEventListener('mouseenter', () => videoEl.play().catch(() => { }));
                cartridge.addEventListener('mouseleave', () => {
                    videoEl.pause();
                    videoEl.currentTime = 0;
                });
            }

            grid.appendChild(cartridge);
        });

        gamesWrapper.appendChild(grid);
    }
}

// ITCH.IO GAME MODAL
function openItchGame(src, title, w, h) {
    const modal = document.getElementById('gameModal');
    const container = document.getElementById('iframeContainer');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.innerText = title.toUpperCase() + '.EXE';

    // Create iframe dynamically based on itch.io embed code
    // We adjust width/height to fit percentage but keep aspect ratio ideally
    // For now, simpler implementation:

    container.innerHTML = `<iframe frameborder="0" src="${src}" allowfullscreen width="${w}" height="${h}"></iframe>`;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    const container = document.getElementById('iframeContainer');

    modal.classList.remove('show');
    container.innerHTML = ''; // Destroy iframe to stop audio/game
    document.body.style.overflow = '';
}

window.onclick = function (event) {
    const modal = document.getElementById('gameModal');
    if (event.target == modal) {
        closeGame();
    }
}
