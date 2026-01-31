/* ===============================
    BASIC WINDOW MANAGER
   =============================== */

let zIndexCounter = 10;

/* ===============================
    OPEN WINDOW
   =============================== */

document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", () => {
        const name = icon.dataset.window;
        const windowEl = document.querySelector(`.window[data-name="${name}"]`);

        if (!windowEl) return;

        windowEl.style.display = "block";
        bringToFront(windowEl);

        // ===== CHECK IF WINDOW IS FULLY VISIBLE =====
        const rect = windowEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const isFullyVisible =
            rect.left >= 0 &&
            rect.top >= 0 &&
            rect.right <= viewportWidth &&
            rect.bottom <= viewportHeight;

        // If window is not fully visible, center it
        if (!isFullyVisible) {
            let newLeft = (viewportWidth - rect.width) / 2;
            let newTop = (viewportHeight - rect.height) / 2;

            windowEl.style.left = `${newLeft}px`;
            windowEl.style.top = `${newTop}px`;
            windowEl.style.transform = "none";
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


