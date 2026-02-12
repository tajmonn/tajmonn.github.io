/* ===============================
    BASIC WINDOW MANAGER
   =============================== */

let zIndexCounter = 10;

/* ===============================
    OPEN WINDOW
   =============================== */

document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", (event) => {
        const name = icon.dataset.window;
        const windowEl = document.querySelector(`.window[data-name="${name}"]`);
        if (!windowEl) return;

        const isAlreadyOpen = windowEl.style.display === "block";

        // Show the window and bring to front
        windowEl.style.display = "block";
        bringToFront(windowEl);

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const rect = windowEl.getBoundingClientRect();

        if (!isAlreadyOpen) {
            // Window is opening for the first time → position near cursor
            let newLeft = event.clientX - 10;
            let newTop = event.clientY + 30;

            // Check if fully visible
            const fits =
                newLeft >= 0 &&
                newTop >= 0 &&
                newLeft + rect.width <= viewportWidth &&
                newTop + rect.height <= viewportHeight;

            if (!fits) {
                // If not fully visible → center
                newLeft = (viewportWidth - rect.width) / 2;
                newTop = (viewportHeight - rect.height) / 2;
            }

            windowEl.style.left = `${newLeft}px`;
            windowEl.style.top = `${newTop}px`;
            windowEl.style.transform = "none";

        } else {
            // Window already open → just check if fully visible
            const isFullyVisible =
                rect.left >= 0 &&
                rect.top >= 0 &&
                rect.right <= viewportWidth &&
                rect.bottom <= viewportHeight;

            if (!isFullyVisible) {
                const newLeft = (viewportWidth - rect.width) / 2;
                const newTop = (viewportHeight - rect.height) / 2;

                windowEl.style.left = `${newLeft}px`;
                windowEl.style.top = `${newTop}px`;
                windowEl.style.transform = "none";
            }
        }
    });
});






/* ===============================
    CLOSE WINDOW
   =============================== */

document.querySelectorAll(".window .close").forEach(btn => {
    btn.addEventListener("click", e => {
        const win = e.target.closest(".window");
        win.style.display = "none";
    });
});

/* ===============================
    FOCUS WINDOW (Z-INDEX)
   =============================== */

document.querySelectorAll(".window").forEach(win => {
    win.addEventListener("mousedown", () => {
        bringToFront(win);
    });
});

function bringToFront(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
}

/* ===============================
    DRAG & DROP WINDOWS
   =============================== */

document.querySelectorAll(".title-bar").forEach(bar => {
    const windowEl = bar.closest(".window");

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    bar.addEventListener("mousedown", e => {
        isDragging = true;
        bringToFront(windowEl);

        const rect = windowEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        bar.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", e => {
        if (!isDragging) return;

        windowEl.style.left = `${e.clientX - offsetX}px`;
        windowEl.style.top = `${e.clientY - offsetY}px`;
        windowEl.style.transform = "none";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        bar.style.cursor = "grab";
    });
});

/* ===============================
    OPTIONAL: ESC TO CLOSE TOP WINDOW
   =============================== */

document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;

    const windows = [...document.querySelectorAll(".window")]
        .filter(w => w.style.display === "block");

    if (windows.length === 0) return;

    const topWindow = windows.reduce((a, b) =>
        parseInt(a.style.zIndex || 0) >
        parseInt(b.style.zIndex || 0)
            ? a
            : b
    );

    topWindow.style.display = "none";
});

/* ===============================
    LOAD MARKDOWN CONTENT
   =============================== */
const renderer = new marked.Renderer();

renderer.link = function(token) {
  const href = token.href || "#";
  const title = token.title || "";
  const text = token.text || href;

  return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title}">${text}</a>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true
});



const markdownSections = [
    { selector: '#about', file: 'markdown/about.md' },
    { selector: '#experience-work', file: 'markdown/experience-work.md' },
    { selector: '#experience-education', file: 'markdown/experience-education.md' },
    { selector: '#contact', file: 'markdown/contact.md' },
    { selector: '#project-website-riri', file: 'markdown/website-riri.md' },
    { selector: '#project-portfolio', file: 'markdown/portfolio.md' }
];

function loadMarkdown(section) {
    fetch(section.file)
        .then(response => response.text())
        .then(md => {
            const html = marked.parse(md);
            document.querySelector(section.selector).innerHTML = html;
        })
        .catch(err => console.error(`Error loading ${section.file}:`, err));
}

markdownSections.forEach(loadMarkdown);