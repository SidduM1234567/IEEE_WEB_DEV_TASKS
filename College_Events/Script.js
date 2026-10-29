const eventForm = document.getElementById("event-form");
const titleInput = document.getElementById("event-title");
const dateInput = document.getElementById("event-date");
const venueInput = document.getElementById("event-venue");
const descInput = document.getElementById("event-desc");
const searchInput = document.getElementById("search-input");
const eventsContainer = document.getElementById("events-container");
const eventCount = document.getElementById("event-count");
const formMessage = document.getElementById("form-message");
const STORAGE_KEY = "campusEvents";
let events = [];
try {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    const parsedEvents = savedEvents ? JSON.parse(savedEvents) : [];
    if (Array.isArray(parsedEvents)) {
        events = parsedEvents.filter(event =>
            event &&
            typeof event.id === "string" &&
            typeof event.title === "string" &&
            typeof event.date === "string" &&
            typeof event.venue === "string" &&
            typeof event.description === "string"
        );
    }
} catch (error) {
    console.error("Could not load saved events:", error);
}
function saveEvents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        return true;
    } catch (error) {
        console.error("Could not save events:", error);
        formMessage.textContent =
            "Warning: Events could not be saved in this browser.";
        return false;
    }
}
function formatDate(date) {
    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }
    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}
function displayEvents(query = "") {
    eventsContainer.replaceChildren();
    const searchTerm = query.trim().toLowerCase();
    const filteredEvents = events
        .filter(event =>
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.venue.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => a.date.localeCompare(b.date));
    eventCount.textContent =
        `${filteredEvents.length} event${filteredEvents.length === 1 ? "" : "s"}`;
    if (filteredEvents.length === 0) {
        const message = searchTerm
            ? "No events match your search."
            : "No events yet. Add your first campus event!";

        eventsContainer.appendChild(
            createTextElement("p", "empty-message", message)
        );
        return;
    }
    filteredEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card";
        const title = createTextElement("h3", "", event.title);
        const date = createTextElement(
            "p",
            "event-date",
            `Date: ${formatDate(event.date)}`
        );
        const venue = createTextElement(
            "p",
            "event-venue",
            `Venue: ${event.venue}`
        );
        const description = createTextElement(
            "p",
            "event-description",
            event.description
        );
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete Event";
        deleteButton.addEventListener("click", () => {
            deleteEvent(event.id);
        });
        card.append(title, date, venue, description, deleteButton);
        eventsContainer.appendChild(card);
    });
}
eventForm.addEventListener("submit", function (event) {
    event.preventDefault();
    formMessage.textContent = "";
    const title = titleInput.value.trim();
    const date = dateInput.value;
    const venue = venueInput.value.trim();
    const description = descInput.value.trim();
    if (!title || !date || !venue || !description) {
        formMessage.textContent = "Please fill in all fields.";
        return;
    }
    const newEvent = {
        id: `${Date.now()}-${Math.random()}`,
        title: title,
        date: date,
        venue: venue,
        description: description
    };
    events.push(newEvent);
    saveEvents();
    eventForm.reset();
    searchInput.value = "";
    displayEvents();
    formMessage.textContent = "Event added successfully!";
});
searchInput.addEventListener("input", function () {
    displayEvents(searchInput.value);
});
function deleteEvent(id) {
    events = events.filter(event => event.id !== id);
    saveEvents();
    displayEvents(searchInput.value);
    formMessage.textContent = "Event deleted.";
}
displayEvents();
