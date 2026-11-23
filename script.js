// Default habits
const defaultHabits = [
    {
        id: 1,
        name: "Drink water",
        emoji: "💧",
        completedDates: []
    },
    {
        id: 2,
        name: "Read a book",
        emoji: "📚",
        completedDates: []
    },
    {
        id: 3,
        name: "Exercise",
        emoji: "🏃",
        completedDates: []
    },
    {
        id: 4,
        name: "Learn coding",
        emoji: "💻",
        completedDates: []
    },
    {
        id: 5,
        name: "Meditate",
        emoji: "🧘",
        completedDates: []
    },
    {
        id: 6,
        name: "Sleep on time",
        emoji: "🌙",
        completedDates: []
    }
];

// Today's date
const today = new Date().toLocaleDateString("en-CA");

// Get HTML elements
const habitGrid = document.getElementById("habitGrid");
const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const formMessage = document.getElementById("formMessage");

// Selected emoji
let selectedEmoji = "🌱";

// Load habits from localStorage
function loadHabits() {
    try {
        const savedHabits = localStorage.getItem("habitlyHabits");

        if (savedHabits === null) {
            return defaultHabits;
        }

        const parsedHabits = JSON.parse(savedHabits);

        if (
            !Array.isArray(parsedHabits) ||
            !parsedHabits.every(habit =>
                habit &&
                typeof habit.id === "number" &&
                typeof habit.name === "string" &&
                typeof habit.emoji === "string" &&
                Array.isArray(habit.completedDates) &&
                habit.completedDates.every(date => typeof date === "string")
            )
        ) {
            return defaultHabits;
        }

        return parsedHabits;

    } catch (error) {
        console.log("Error loading habits:", error);
        return defaultHabits;
    }
}

// Habit array
let habits = loadHabits();

// Save habits
function saveHabits() {
    try {
        localStorage.setItem("habitlyHabits", JSON.stringify(habits));
    } catch (error) {
        console.log("Error saving habits:", error);
        showMessage("Unable to save data. Check your browser storage.", "error");
    }
}

// Get today's date
function getToday() {
    return new Date().toLocaleDateString("en-CA");
}

// Display message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}

// Escape user input before adding it to HTML
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Create one habit card
function createHabitCard(habit) {

    const isCompleted = habit.completedDates.includes(getToday());

    return `
        <article class="habit-card">

            <div class="habit-emoji">
                ${escapeHTML(habit.emoji)}
            </div>

            <div class="habit-info">
                <h3>${escapeHTML(habit.name)}</h3>
                <p>Keep building your daily routine.</p>
            </div>

            <div class="habit-streak">
                ${isCompleted ? "✓ Completed today" : "🌱 Keep going!"}
            </div>

            <div class="habit-actions">

                <button
                    class="complete-btn ${isCompleted ? "completed" : ""}"
                    data-action="complete"
                    data-id="${habit.id}"
                >
                    ${isCompleted ? "✓ Completed" : "✓ Complete"}
                </button>

                <button
                    class="delete-btn"
                    data-action="delete"
                    data-id="${habit.id}"
                    aria-label="Delete ${escapeHTML(habit.name)}"
                    title="Delete habit"
                >
                    🗑
                </button>

            </div>

        </article>
    `;
}

// Render all habit cards
function renderHabits() {

    if (habits.length === 0) {

        habitGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-emoji">🌱</div>
                <h3>No habits yet!</h3>
                <p>Add your first habit and start building a better routine.</p>
            </div>
        `;

    } else {

        habitGrid.innerHTML = habits
            .map(createHabitCard)
            .join("");
    }

    updateStats();
}

// Add a new habit
function addHabit(event) {

    event.preventDefault();

    const name = habitInput.value.trim();

    if (name === "") {
        showMessage("Please enter a habit name!", "error");
        return;
    }

    const duplicate = habits.some(habit =>
        habit.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        showMessage("This habit already exists!", "error");
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        emoji: selectedEmoji,
        completedDates: []
    };

    habits.push(newHabit);

    saveHabits();
    renderHabits();

    habitInput.value = "";

    showMessage("Your new habit has been added successfully! 🎉", "success");
}

// Complete or undo a habit
function toggleHabit(id) {

    const habit = habits.find(habit => habit.id === id);

    if (!habit) return;

    const today = getToday();

    if (habit.completedDates.includes(today)) {

        habit.completedDates = habit.completedDates.filter(
            date => date !== today
        );

    } else {

        habit.completedDates.push(today);
    }

    saveHabits();
    renderHabits();
}

// Delete habit
function deleteHabit(id) {

    const habit = habits.find(habit => habit.id === id);

    if (!habit) return;

    const confirmDelete = confirm(
        `Are you sure you want to delete "${habit.name}"?`
    );

    if (confirmDelete) {

        habits = habits.filter(habit => habit.id !== id);

        saveHabits();
        renderHabits();
    }
}

// Handle habit buttons
habitGrid.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "complete") {
        toggleHabit(id);
    }

    if (button.dataset.action === "delete") {
        deleteHabit(id);
    }
});

// Update statistics
function updateStats() {

    const total = habits.length;

    const completed = habits.filter(habit =>
        habit.completedDates.includes(getToday())
    ).length;

    const remaining = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("doneCount").innerHTML =
        `${completed} <span>/ ${total}</span>`;

    document.getElementById("totalCount").textContent = total;

    document.getElementById("remainingCount").textContent = remaining;

    document.getElementById("habitCount").textContent =
        `${total} HABITS`;

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("remainingFill").style.width =
        (100 - percentage) + "%";
}

// Emoji selection
document.querySelectorAll(".emoji-btn").forEach(button => {

    button.addEventListener("click", function() {

        document.querySelectorAll(".emoji-btn").forEach(btn => {
            btn.classList.remove("selected");
        });

        this.classList.add("selected");

        selectedEmoji = this.dataset.emoji;
    });
});

// Form submission
habitForm.addEventListener("submit", addHabit);

// Display current date
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

// Daily quote fallback
const fallbackQuotes = [
    {
        quote: "Consistency beats perfection.",
        author: "Habitly"
    },
    {
        quote: "Small steps every day lead to big results.",
        author: "Habitly"
    },
    {
        quote: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        quote: "Great things are done by a series of small things brought together.",
        author: "Vincent van Gogh"
    }
];

// Fetch daily quote
async function getDailyQuote() {

    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");

    quoteText.textContent = "Loading...";
    quoteAuthor.textContent = "Getting your daily motivation...";

    try {

        const response = await fetch(
            "https://dummyjson.com/quotes/random"
        );

        if (!response.ok) {
            throw new Error("Unable to fetch quote");
        }

        const data = await response.json();

        if (!data.quote || !data.author) {
            throw new Error("Invalid quote data");
        }

        quoteText.textContent = data.quote;
        quoteAuthor.textContent = "— " + data.author;

    } catch (error) {

        console.log("Quote API error:", error);

        const randomQuote = fallbackQuotes[
            Math.floor(Math.random() * fallbackQuotes.length)
        ];

        quoteText.textContent = randomQuote.quote;
        quoteAuthor.textContent = "— " + randomQuote.author;
    }
}

// Start application
renderHabits();
getDailyQuote();
