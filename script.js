/* ===============================
    DESKTOP BUILDER
    Generates .icon and .window elements from data.json,
    matching the structure/classes of the original hand-written HTML.
   =============================== */

const ICONS = {
    file: { img: "icons/text-icon.png", windowClass: "window-text" },
    folder: { img: "icons/folder-icon.png", windowClass: "window-folder" },
    image: { img: "icons/image-icon.png", windowClass: "window-image" }
};

let zIndexCounter = 10;
const markdownQueue = [];

// Turns a name into a safe id/data-name fragment (used only when a node
// doesn't provide its own "id" in the JSON).
function slugify(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents/diacritics
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/i, "")    // drop file extension
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function makeSlug(node, parentSlug) {
    if (node.id) return node.id; // explicit override from JSON wins
    const base = slugify(node.name);
    return parentSlug ? `${parentSlug}-${base}` : base;
}

// Builds the "C:\FOLDER\FILE.TXT" style title bar text
function makeTitle(node, ancestorNames) {
    const names = [...ancestorNames, node.name].map(n => n.toLocaleUpperCase("pl-PL"));
    return "C:\\" + names.join("\\");
}

function createIcon(slug, node) {
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.dataset.window = slug;

    const img = document.createElement("img");
    img.src = ICONS[node.type].img;
    img.alt = `${node.name} icon`;

    const span = document.createElement("span");
    span.textContent = node.name;

    icon.append(img, span);
    return icon;
}

function createWindow(slug, node, title) {
    const win = document.createElement("div");
    win.className = `window ${ICONS[node.type].windowClass}`;
    win.id = `window-${slug}`;
    win.dataset.name = slug;

    const titleBar = document.createElement("div");
    titleBar.className = "title-bar";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;

    const controls = document.createElement("div");
    controls.className = "window-controls";
    const closeBtn = document.createElement("button");
    closeBtn.className = "close";
    closeBtn.textContent = "X";
    controls.appendChild(closeBtn);

    titleBar.append(titleSpan, controls);

    const content = document.createElement("div");
    content.className = "window-content";

    if (node.type === "file") {
        const contentId = node.contentId || slug;
        content.id = contentId;
        markdownQueue.push({ selector: `#${contentId}`, file: node.markdown });
    } else if (node.type === "image") {
        const img = document.createElement("img");
        img.src = node.src;
        img.alt = node.name;
        content.appendChild(img);
    }
    // folders leave window-content empty here; children are appended into it below

    win.append(titleBar, content);
    return win;
}

function buildNode(node, parentSlug, ancestorNames, iconContainer, windowsRoot) {
    const slug = makeSlug(node, parentSlug);
    const title = makeTitle(node, ancestorNames);

    iconContainer.appendChild(createIcon(slug, node));

    const win = createWindow(slug, node, title);
    windowsRoot.appendChild(win);

    if (node.type === "folder" && Array.isArray(node.children)) {
        const childIconContainer = win.querySelector(".window-content");
        node.children.forEach(child =>
            buildNode(child, slug, [...ancestorNames, node.name], childIconContainer, windowsRoot)
        );
    }
}

function buildDesktop(tree) {
    const desktop = document.getElementById("desktop");
    tree.forEach(node => buildNode(node, "", [], desktop, document.body));
}

/* ===============================
    WINDOW MANAGER
   =============================== */

function bringToFront(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
}

function initWindowManager() {
    document.querySelectorAll(".icon").forEach(icon => {
        icon.addEventListener("click", event => {
            const name = icon.dataset.window;
            const windowEl = document.querySelector(`.window[data-name="${name}"]`);
            if (!windowEl) return;

            const isAlreadyOpen = windowEl.style.display === "block";

            windowEl.style.display = "block";
            bringToFront(windowEl);

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const rect = windowEl.getBoundingClientRect();

            if (!isAlreadyOpen) {
                let newLeft = event.clientX - 10;
                let newTop = event.clientY + 30;

                const fits =
                    newLeft >= 0 &&
                    newTop >= 0 &&
                    newLeft + rect.width <= viewportWidth &&
                    newTop + rect.height <= viewportHeight;

                if (!fits) {
                    newLeft = (viewportWidth - rect.width) / 2;
                    newTop = (viewportHeight - rect.height) / 2;
                }

                windowEl.style.left = `${newLeft}px`;
                windowEl.style.top = `${newTop}px`;
                windowEl.style.transform = "none";
            } else {
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

    document.querySelectorAll(".window .close").forEach(btn => {
        btn.addEventListener("click", e => {
            const win = e.target.closest(".window");
            win.style.display = "none";
        });
    });

    document.querySelectorAll(".window").forEach(win => {
        win.addEventListener("pointerdown", () => bringToFront(win));
    });

    document.querySelectorAll(".title-bar").forEach(bar => {
        const windowEl = bar.closest(".window");

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        bar.addEventListener("pointerdown", e => {
            isDragging = true;
            bringToFront(windowEl);

            const rect = windowEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            bar.style.cursor = "grabbing";
        });

        document.addEventListener("pointermove", e => {
            if (!isDragging) return;
            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
            windowEl.style.transform = "none";
        });

        document.addEventListener("pointerup", () => {
            isDragging = false;
            bar.style.cursor = "grab";
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;

        const windows = [...document.querySelectorAll(".window")]
            .filter(w => w.style.display === "block");

        if (windows.length === 0) return;

        const topWindow = windows.reduce((a, b) =>
            parseInt(a.style.zIndex || 0) > parseInt(b.style.zIndex || 0) ? a : b
        );

        topWindow.style.display = "none";
    });
}

/* ===============================
    MARKDOWN RENDERING
   =============================== */

const renderer = new marked.Renderer();

renderer.link = function (token) {
    const href = token.href || "#";
    const title = token.title || "";
    const text = token.text || href;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title}">${text}</a>`;
};

marked.setOptions({ renderer, gfm: true, breaks: true });

function getAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    const lastDigit = age % 10;
    if (lastDigit >= 2 && lastDigit <= 4) return `${age} lata`;
    return `${age} lat`;
}

function loadMarkdown(section) {
    fetch(section.file)
        .then(response => response.text())
        .then(md => {
            md = md.replace(/\{\{AGE\}\}/g, getAge("2002-02-06"));
            const html = marked.parse(md);
            document.querySelector(section.selector).innerHTML = html;
        })
        .catch(err => console.error(`Error loading ${section.file}:`, err));
}

/* ===============================
    INIT
   =============================== */

fetch("desktop-data.json")
    .then(res => res.json())
    .then(tree => {
        buildDesktop(tree);
        initWindowManager();
        markdownQueue.forEach(loadMarkdown);
    })
    .catch(err => console.error("Error loading data.json:", err));