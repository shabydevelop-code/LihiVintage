/**
 * Lihi Vintage - Accessibility Toolbar Extension
 * A standalone, plug-and-play accessibility widget.
 */

(function() {
    // 1. Inject Accessibility CSS
    const css = `
        .accessibility-widget {
            position: fixed;
            bottom: 30px;
            left: 30px;
            z-index: 10001;
            font-family: 'Assistant', sans-serif;
            direction: rtl;
        }

        .acc-trigger {
            width: 65px;
            height: 65px;
            background-color: var(--accent-color, #825e3c);
            color: #fff;
            border-radius: 50%;
            border: 4px solid #fff;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            transition: all 0.3s ease;
        }

        .acc-trigger:hover {
            transform: scale(1.1);
            background-color: #3b2c1e;
        }

        .acc-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(2px);
            z-index: 10001;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .acc-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .acc-sidebar {
            position: fixed;
            bottom: 110px;
            left: -380px;
            width: 350px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 20px;
            z-index: 10002;
            overflow-y: auto;
            max-height: calc(100vh - 150px);
            border: 1px solid rgba(0,0,0,0.05);
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .acc-sidebar::-webkit-scrollbar {
            display: none;
        }

        .acc-sidebar.active {
            left: 30px;
        }

        .acc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 2px solid #f0f0f0;
        }

        .acc-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: #1a1410;
        }

        .acc-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #999;
        }

        .acc-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .acc-btn {
            background: #fcfbf9;
            border: 1px solid #eee;
            padding: 8px 4px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            font-size: 0.8rem;
            transition: all 0.2s;
            color: #444;
            text-align: center;
            font-weight: 600;
        }

        .acc-btn i {
            font-size: 1.1rem;
            color: var(--accent-color, #825e3c);
        }

        .acc-btn:hover {
            background: #fff;
            border-color: var(--accent-color, #825e3c);
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .acc-btn.active {
            background-color: #3b2c1e;
            color: #fff;
            border-color: #3b2c1e;
        }

        .acc-btn.active i {
            color: #fff;
        }

        .acc-reset {
            grid-column: span 2;
            background-color: #ff4d4d;
            color: #fff;
            border: none;
            margin-top: 5px;
            padding: 10px !important;
        }
        
        .acc-reset:hover {
            background-color: #cc0000;
        }

        /* Accessibility Classes */
        html.acc-grayscale { filter: grayscale(100%); }
        .accessibility-widget { filter: none !important; } /* Stay colorful and visible */
        
        body.acc-contrast { background: #000 !important; color: #fff !important; }
        body.acc-contrast * { background: #000 !important; color: #fff !important; border-color: #fff !important; }
        body.acc-underline a { text-decoration: underline !important; }
        body.acc-big-cursor { cursor: url('https://cur.cursors-4u.net/others/oth-1/oth1.cur'), auto !important; }
        
        .acc-font-large { font-size: 1.25rem !important; }
        .acc-font-xlarge { font-size: 1.5rem !important; }

        @media (max-width: 480px) {
            .acc-sidebar { width: 280px; left: -310px; bottom: 90px; }
            .acc-sidebar.active { left: 20px; }
            .acc-trigger { width: 55px; height: 55px; left: 20px; bottom: 20px; }
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // 2. Inject Accessibility HTML
    const widget = document.createElement('div');
    widget.className = 'accessibility-widget';
    widget.innerHTML = `
        <div class="acc-overlay"></div>
        <button class="acc-trigger" aria-label="פתח סרגל נגישות">
            <i class="fa-solid fa-universal-access"></i>
        </button>
        <div class="acc-sidebar">
            <div class="acc-header">
                <h3>סרגל נגישות</h3>
                <button class="acc-close">&times;</button>
            </div>
            <div class="acc-grid">
                <button class="acc-btn" data-action="contrast">
                    <i class="fa-solid fa-circle-half-stroke"></i>
                    ניגודיות גבוהה
                </button>
                <button class="acc-btn" data-action="grayscale">
                    <i class="fa-solid fa-droplet-slash"></i>
                    מצב אפור
                </button>
                <button class="acc-btn" data-action="font-inc">
                    <i class="fa-solid fa-font"></i>
                    הגדלת טקסט
                </button>
                <button class="acc-btn" data-action="underline">
                    <i class="fa-solid fa-underline"></i>
                    הדגשת קישורים
                </button>
                <button class="acc-btn" data-action="cursor">
                    <i class="fa-solid fa-mouse-pointer"></i>
                    סמן גדול
                </button>
                <button class="acc-btn" data-action="readable">
                    <i class="fa-solid fa-eye"></i>
                    פונט קריא
                </button>
                <button class="acc-btn" data-action="statement" id="accStatementBtn">
                    <i class="fa-solid fa-file-contract"></i>
                    הצהרת נגישות
                </button>
                <button class="acc-btn acc-reset" data-action="reset">
                    <i class="fa-solid fa-rotate-left" style="color:#fff"></i>
                    איפוס וביטול
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // Hide statement button if already on accessibility page
    if (window.location.pathname.includes('accessibility.html')) {
        const btn = widget.querySelector('#accStatementBtn');
        if (btn) btn.style.display = 'none';
    }

    // 3. Logic & Actions
    const sidebar = widget.querySelector('.acc-sidebar');
    const overlay = widget.querySelector('.acc-overlay');
    const trigger = widget.querySelector('.acc-trigger');
    const closeBtn = widget.querySelector('.acc-close');
    const buttons = widget.querySelectorAll('.acc-btn');
    
    let fontSizeLevel = 0; // 0, 1, 2

    const toggleSidebar = (forceClose = false) => {
        if (forceClose) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    };

    trigger.addEventListener('click', () => toggleSidebar());
    closeBtn.addEventListener('click', () => toggleSidebar(true));
    overlay.addEventListener('click', () => toggleSidebar(true));

    const actions = {
        contrast: () => document.body.classList.toggle('acc-contrast'),
        grayscale: () => document.documentElement.classList.toggle('acc-grayscale'),
        underline: () => document.body.classList.toggle('acc-underline'),
        cursor: () => document.body.classList.toggle('acc-big-cursor'),
        readable: () => {
            document.body.style.fontFamily = document.body.style.fontFamily === 'Arial, sans-serif' ? "'Assistant', sans-serif" : 'Arial, sans-serif';
        },
        statement: () => window.location.href = "accessibility.html",
        'font-inc': (btn) => {
            fontSizeLevel = (fontSizeLevel + 1) % 3;
            document.documentElement.classList.remove('acc-font-large', 'acc-font-xlarge');
            if (fontSizeLevel === 1) document.documentElement.classList.add('acc-font-large');
            if (fontSizeLevel === 2) document.documentElement.classList.add('acc-font-xlarge');
            btn.innerHTML = fontSizeLevel === 0 ? '<i class="fa-solid fa-font"></i>הגדלת טקסט' : 
                            (fontSizeLevel === 1 ? '<i class="fa-solid fa-font"></i>הגדלה +1' : '<i class="fa-solid fa-font"></i>הגדלה +2');
        },
        reset: () => {
            document.body.classList.remove('acc-contrast', 'acc-underline', 'acc-big-cursor');
            document.documentElement.classList.remove('acc-grayscale', 'acc-font-large', 'acc-font-xlarge');
            document.body.style.fontFamily = "";
            fontSizeLevel = 0;
            buttons.forEach(b => b.classList.remove('active'));
            sidebar.classList.remove('active');
        }
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action !== 'reset' && action !== 'font-inc') {
                btn.classList.toggle('active');
            }
            if (actions[action]) actions[action](btn);
        });
    });

    // Close on escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') sidebar.classList.remove('active');
    });

})();
