const galleryGrid = document.getElementById("gallery-grid");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCredit = document.getElementById("lightbox-credit");
const lightboxDate = document.getElementById("lightbox-date");
const lightboxNotes = document.getElementById("lightbox-notes");
const lightboxClose = document.getElementById("lightbox-close");

let lightboxLiterature = document.getElementById("lightbox-literature");

if (!lightboxLiterature && lightbox) {
    lightboxLiterature = document.createElement("div");
    lightboxLiterature.id = "lightbox-literature";
    lightboxLiterature.classList.add("lightbox-literature");
    lightboxImage.insertAdjacentElement("afterend", lightboxLiterature);
}

const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

let archiveItems = [];
let currentArchiveIndex = 0;

async function loadArchive() {
    if (!galleryGrid) return;

    const archivePath = galleryGrid.dataset.gallery;

    try {
        const response = await fetch(archivePath);

        if (!response.ok) {
            throw new Error(`Archive failed to load: ${response.status}`);
        }

        const archiveData = await response.json();

        archiveItems = createArchiveItems(archiveData);

        if (archiveData.gallery) {
            buildGallery(archiveData.gallery);
        }

        if (archiveData.literature) {
            buildLiterature(archiveData.literature);
        }

    } catch (error) {
        console.error("Failed to load archive:", error);

        galleryGrid.innerHTML = `
            <p class="gallery-error">
                The archive could not be loaded.
            </p>
        `;
    }
}

function createArchiveItems(archiveData) {
    const items = [];

    if (archiveData.gallery) {
        archiveData.gallery.forEach((section) => {
            section.items.forEach((image) => {
                image.type = "image";
                image.archiveIndex = items.length;
                items.push(image);
            });
        });
    }

    if (archiveData.literature) {
        archiveData.literature.forEach((section) => {
            section.items.forEach((story) => {
                story.type = "literature";
                story.archiveIndex = items.length;
                items.push(story);
            });
        });
    }

    return items;
}

function buildGallery(sections) {
    sections.forEach((section, index) => {
        const sectionWrapper = document.createElement("div");
        sectionWrapper.classList.add("gallery-section");

        if (index > 0) {
            sectionWrapper.classList.add("gallery-hidden-section");
        }

        const sectionTitle = document.createElement("h3");
        sectionTitle.classList.add("gallery-section-title");
        sectionTitle.textContent = section.section;

        sectionWrapper.appendChild(sectionTitle);

        const sectionGrid = document.createElement("div");
        sectionGrid.classList.add("gallery-section-grid");

        section.items.forEach((image) => {
            const button = document.createElement("button");
            button.classList.add("gallery-thumb");
            button.type = "button";

            const img = document.createElement("img");
            img.src = image.thumb;
            img.alt = image.note || "Gallery artwork";
            img.loading = "lazy";

            button.appendChild(img);

            button.addEventListener("click", () => {
                openArchiveItem(image);
            });

            sectionGrid.appendChild(button);
        });
// PLACEHOLDERS GO HERE
            const previewCount = 10;
            const missingSlots = previewCount - section.items.length;

            if (missingSlots > 0) {

            for (let i = 0; i < missingSlots; i++) {

            const placeholder = document.createElement("div");

            placeholder.classList.add("gallery-placeholder");

            sectionGrid.appendChild(placeholder);

    }

}

sectionWrapper.appendChild(sectionGrid);
galleryGrid.appendChild(sectionWrapper);
    });
}

function buildLiterature(sections) {
    sections.forEach((section) => {
        const sectionWrapper = document.createElement("div");
        sectionWrapper.classList.add("literature-section");

        const sectionTitle = document.createElement("h3");
        sectionTitle.classList.add("gallery-section-title");
        sectionTitle.textContent = section.section;

        sectionWrapper.appendChild(sectionTitle);

        const literatureList = document.createElement("div");
        literatureList.classList.add("literature-list");

        section.items.forEach((story) => {
            const button = document.createElement("button");
            button.classList.add("literature-item");
            button.type = "button";

            const title = document.createElement("span");
            title.classList.add("literature-title");
            title.textContent = story.title;

            const meta = document.createElement("span");
            meta.classList.add("literature-preview-meta");
            meta.textContent = story.created || "";

            button.appendChild(title);

            if (story.created) {
                button.appendChild(meta);
            }

            button.addEventListener("click", () => {
                openArchiveItem(story);
            });

            literatureList.appendChild(button);
        });

        sectionWrapper.appendChild(literatureList);
        galleryGrid.appendChild(sectionWrapper);
    });
}

function openArchiveItem(item) {
    currentArchiveIndex = item.archiveIndex;

    if (currentArchiveIndex === undefined) {
        currentArchiveIndex = 0;
    }

    showArchiveItem(currentArchiveIndex);
}

function showArchiveItem(index) {
    const item = archiveItems[index];

    if (!item) return;

    if (item.type === "image") {
        openImageLightbox(item);
    }

    if (item.type === "literature") {
        openLiteratureLightbox(item);
    }
}

function showPreviousArchiveItem() {
    currentArchiveIndex--;

    if (currentArchiveIndex < 0) {
        currentArchiveIndex = archiveItems.length - 1;
    }

    showArchiveItem(currentArchiveIndex);
}

function showNextArchiveItem() {
    currentArchiveIndex++;

    if (currentArchiveIndex >= archiveItems.length) {
        currentArchiveIndex = 0;
    }

    showArchiveItem(currentArchiveIndex);
}

function openImageLightbox(image) {
    lightboxImage.style.display = "";
    lightboxLiterature.style.display = "none";
    lightboxLiterature.innerHTML = "";

    lightboxImage.src = image.src;
    lightboxImage.alt = image.note || "Gallery artwork";

    renderMeta(image);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
}

async function openLiteratureLightbox(story) {
    lightboxImage.style.display = "none";
    lightboxImage.src = "";
    lightboxImage.alt = "";

    lightboxLiterature.style.display = "block";
    lightboxLiterature.innerHTML = `
        <p class="literature-loading">
            Opening the archive...
        </p>
    `;

    renderMeta(story);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");

    try {
        const response = await fetch(story.url);

        if (!response.ok) {
            throw new Error(`Story failed to load: ${response.status}`);
        }

        const storyHTML = await response.text();

        lightboxLiterature.innerHTML = storyHTML;

    } catch (error) {
        console.error("Failed to load literature:", error);

        lightboxLiterature.innerHTML = `
            <p class="literature-error">
                This story could not be loaded.
            </p>
        `;
    }
}

function renderMeta(item) {
    lightboxCredit.innerHTML = "";

    if (item.artists && item.artists.length > 0) {
        item.artists.forEach((artist, index) => {
            if (artist.url) {
                const link = document.createElement("a");

                link.href = artist.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = artist.name;

                lightboxCredit.appendChild(link);
            } else {
                const span = document.createElement("span");
                span.textContent = artist.name;

                lightboxCredit.appendChild(span);
            }

            if (index < item.artists.length - 1) {
                lightboxCredit.append(", ");
            }
        });
    } else {
        lightboxCredit.textContent = "Unknown Artist";
    }

    lightboxDate.textContent = item.created || "";
    lightboxNotes.innerHTML = "";

    if (item.tags && item.tags.length > 0) {
        const tagsWrapper = document.createElement("div");
        tagsWrapper.classList.add("lightbox-tags");

        item.tags.forEach((tag) => {
            const tagSpan = document.createElement("span");
            tagSpan.classList.add("lightbox-tag");
            tagSpan.textContent = tag;

            tagsWrapper.appendChild(tagSpan);
        });

        lightboxNotes.appendChild(tagsWrapper);
    }

    if (item.note) {
        const note = document.createElement("p");
        note.classList.add("lightbox-note");
        note.textContent = item.note;

        lightboxNotes.appendChild(note);
    }
}

function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");

    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxImage.style.display = "";

    lightboxLiterature.innerHTML = "";
    lightboxLiterature.style.display = "none";
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        lightbox.classList.contains("is-open")
    ) {
        closeLightbox();
    }
});

const galleryToggle = document.getElementById("gallery-toggle");

if (galleryToggle) {
    galleryToggle.addEventListener("click", () => {
        document.body.classList.toggle("gallery-expanded");

        const isExpanded =
            document.body.classList.contains("gallery-expanded");

        galleryToggle.textContent = isExpanded
            ? "Seal the Gallery"
            : "Open the Gallery";
    });
}

if (lightboxPrev) {
    lightboxPrev.addEventListener("click", showPreviousArchiveItem);
}

if (lightboxNext) {
    lightboxNext.addEventListener("click", showNextArchiveItem);
}

loadArchive();