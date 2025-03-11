/**
 * Survio Pop-up Script
 * Skript pro vytvoření pop-up okna s formulářem Survio
 */
(function() {
    // Konfigurace
    const config = {
        surveyUrl: "https://www.survio.com/survey/d/U1W4V6F5A5K9W0L3B",
        delay: 3000, // 3 sekundy
        cookieDuration: 1, // 1 den
        cookieName: 'survioPopupShown'
    };

    // Funkce pro nastavení cookie
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    // Funkce pro získání cookie
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    // Vytvoření CSS
    function injectStyles() {
        const styles = `
            .survio-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 1000;
            }
            
            .survio-popup {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 800px;
                height: 80%;
                background-color: white;
                border-radius: 5px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                z-index: 1001;
                display: flex;
                flex-direction: column;
            }
            
            .survio-close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                background: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                z-index: 10;
                transition: color 0.3s, background-color 0.3s;
            }
            
            .survio-close-btn:hover {
                color: #000;
                background-color: #f0f0f0;
            }
            
            .survio-popup-content {
                flex-grow: 1;
                overflow: auto;
                padding: 0;
                width: 100%;
                height: 100%;
            }
            
            .survio-popup-content iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            .survio-second-modal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 450px;
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                z-index: 1002;
                text-align: center;
                font-family: "Source Sans Pro", sans-serif !important;
                color: #3a3a45;
                font-size: 1.1rem;
                background: #f7f7f7;
            }
            
            .survio-second-modal p {
                margin-bottom: 20px;
                line-height: 1.5;
            }
            
            .survio-button-container {
                display: flex;
                justify-content: center;
                gap: 15px;
            }
            
            .survio-modal-btn {
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            
            .survio-open-btn {
                background-color: #4CAF50;
                color: white;
            }
            
            .survio-open-btn:hover {
                background-color: #45a049;
            }
            
            .survio-close-modal-btn {
                background-color: #f1f1f1;
                color: #333;
            }
            
            .survio-close-modal-btn:hover {
                background-color: #e0e0e0;
            }
        `;
        
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    // Vytvoření DOM prvků
    function createElements() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'survio-overlay';
        overlay.id = 'survioOverlay';
        
        // Hlavní popup
        const popup = document.createElement('div');
        popup.className = 'survio-popup';
        popup.id = 'survioPopup';
        
        // Tlačítko pro zavření
        const closeBtn = document.createElement('button');
        closeBtn.className = 'survio-close-btn';
        closeBtn.id = 'survioCloseBtn';
        closeBtn.innerHTML = '✕';
        
        // Obsah popu-up
        const popupContent = document.createElement('div');
        popupContent.className = 'survio-popup-content';
        
        // iFrame
        const iframe = document.createElement('iframe');
        iframe.src = config.surveyUrl;
        iframe.title = 'Dotazník';
        
        // Druhé modální okno
        const secondModal = document.createElement('div');
        secondModal.className = 'survio-second-modal';
        secondModal.id = 'survioSecondModal';
        
        // Text v druhém modálním okně
        const modalText = document.createElement('p');
        modalText.textContent = 'Nechcete si dotazník otevřít v novém okně a vrátit se k němu později?';
        
        // Kontejner pro tlačítka
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'survio-button-container';
        
        // Tlačítko pro otevření v novém okně
        const openBtn = document.createElement('button');
        openBtn.className = 'survio-modal-btn survio-open-btn';
        openBtn.id = 'survioOpenNewWindow';
        openBtn.textContent = 'Otevřít v novém okně';
        
        // Tlačítko pro zavření
        const closeModalBtn = document.createElement('button');
        closeModalBtn.className = 'survio-modal-btn survio-close-modal-btn';
        closeModalBtn.id = 'survioCloseModal';
        closeModalBtn.textContent = 'Zavřít';
        
        // Sestavení struktury
        popupContent.appendChild(iframe);
        popup.appendChild(closeBtn);
        popup.appendChild(popupContent);
        overlay.appendChild(popup);
        
        buttonContainer.appendChild(openBtn);
        buttonContainer.appendChild(closeModalBtn);
        secondModal.appendChild(modalText);
        secondModal.appendChild(buttonContainer);
        
        document.body.appendChild(overlay);
        document.body.appendChild(secondModal);
    }

    // Přidání event listenerů
    function setupEventListeners() {
        const overlay = document.getElementById('survioOverlay');
        const closeBtn = document.getElementById('survioCloseBtn');
        const secondModal = document.getElementById('survioSecondModal');
        const openNewWindow = document.getElementById('survioOpenNewWindow');
        const closeModal = document.getElementById('survioCloseModal');
        
        // Zavření pop-up okna a zobrazení druhého modálního okna
        closeBtn.addEventListener('click', function() {
            document.getElementById('survioPopup').style.display = 'none';
            secondModal.style.display = 'block';
        });
        
        // Otevření dotazníku v novém okně
        openNewWindow.addEventListener('click', function() {
            window.open(config.surveyUrl, '_blank');
            secondModal.style.display = 'none';
            overlay.style.display = 'none';
            // Nastavení cookie
            setCookie(config.cookieName, 'true', config.cookieDuration);
        });
        
        // Zavření druhého modálního okna
        closeModal.addEventListener('click', function() {
            secondModal.style.display = 'none';
            overlay.style.display = 'none';
            // Nastavení cookie
            setCookie(config.cookieName, 'true', config.cookieDuration);
        });
    }

    // Inicializace
    function init() {
        // Kontrola, jestli již byla cookie nastavena
        if (!getCookie(config.cookieName)) {
            injectStyles();
            createElements();
            setupEventListeners();
            
            // Zobrazení pop-up okna po nastaveném zpoždění
            setTimeout(function() {
                document.getElementById('survioOverlay').style.display = 'block';
            }, config.delay);
        }
    }

    // Spuštění inicializace po načtení DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMContentLoaded již proběhl
        init();
    }
})();
