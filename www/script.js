
document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const tasksContainer = document.getElementById('tasks-list');
    const upcomingTasksContainer = document.getElementById('upcoming-tasks');
    const progressBar = document.getElementById('progress-bar');
    const totalTasksElem = document.getElementById('total-tasks');
    const completedTasksElem = document.getElementById('completed-tasks');
    const remainingTasksElem = document.getElementById('remaining-tasks');
    const completionPercentageElem = document.getElementById('completion-percentage');
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTaskTitle = document.getElementById('new-task-title');
    const newTaskDesc = document.getElementById('new-task-desc');
    const newTaskCategory = document.getElementById('new-task-category');
    const newTaskDeadline = document.getElementById('new-task-deadline');
    const newTaskPriority = document.getElementById('new-task-priority');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryButtons = document.querySelectorAll('.category');
    const notification = document.getElementById('notification');
    const currentDateElem = document.getElementById('current-date');
    const currentStreakElem = document.getElementById('current-streak');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Mobile navigation elements
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.getElementById('sidebar');
    const mobileCategorySelector = document.getElementById('mobile-category-selector');
    const mobileBackBtn = document.getElementById('mobile-back-btn');
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    // Dashboard elements
    const dashboardCompleted = document.getElementById('dashboard-completed');
    const dashboardActive = document.getElementById('dashboard-active');
    const dashboardStreak = document.getElementById('dashboard-streak');
    const dashboardProductivity = document.getElementById('dashboard-productivity');

    // Set current date
    const today = new Date();
    currentDateElem.textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Set minimum date for deadline input to today
    newTaskDeadline.min = today.toISOString().split('T')[0];

    // Motivational quotes
    const motivationalQuotes = [
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
        { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
        { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
        { text: "Dream big and dare to fail.", author: "Norman Vaughan" }
    ];

    // Initialize tasks from localStorage or empty array
    let tasks = JSON.parse(localStorage.getItem('dreamTrackerTasks')) || [];
    let currentFilter = 'all';
    let currentCategory = 'all';
    let currentStreak = parseInt(localStorage.getItem('dreamTrackerStreak')) || 0;
    let lastActivityDate = localStorage.getItem('dreamTrackerLastActivity') || today.toDateString();

    // Check and update streak
    function updateStreak() {
        const todayStr = today.toDateString();
        const lastActivity = new Date(lastActivityDate);
        const diffTime = Math.abs(today - lastActivity);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // User was active yesterday, increment streak
            currentStreak++;
        } else if (diffDays > 1) {
            // User missed a day, reset streak
            currentStreak = 1;
        }
        // If diffDays is 0, user already updated today, keep streak as is

        lastActivityDate = todayStr;
        localStorage.setItem('dreamTrackerStreak', currentStreak.toString());
        localStorage.setItem('dreamTrackerLastActivity', lastActivityDate);

        currentStreakElem.textContent = currentStreak;
        dashboardStreak.textContent = currentStreak;
    }

    // Show random motivational quote
    function showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        const quote = motivationalQuotes[randomIndex];
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
    }

    // Show notification
    function showNotification(message, isError = false, isWarning = false) {
        notification.textContent = message;
        notification.className = 'notification';

        if (isError) {
            notification.classList.add('error');
        } else if (isWarning) {
            notification.classList.add('warning');
        }

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('dreamTrackerTasks', JSON.stringify(tasks));
    }

    // Update stats
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const remainingTasks = totalTasks - completedTasks;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        totalTasksElem.textContent = totalTasks;
        completedTasksElem.textContent = completedTasks;
        remainingTasksElem.textContent = remainingTasks;
        completionPercentageElem.textContent = `${progressPercentage.toFixed(1)}%`;
        progressBar.style.width = `${progressPercentage}%`;

        // Update dashboard
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        const completedThisMonth = tasks.filter(task => {
            if (!task.completed || !task.completedDate) return false;
            const completedDate = new Date(task.completedDate);
            return completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear;
        }).length;

        dashboardCompleted.textContent = completedThisMonth;
        dashboardActive.textContent = remainingTasks;
        dashboardProductivity.textContent = `${progressPercentage.toFixed(0)}%`;
    }

    // Create confetti animation
    function createConfetti() {
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Render tasks based on current filter and category
    function renderTasks() {
        tasksContainer.innerHTML = '';

        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="far fa-smile"></i>
                            <h3>No goals yet</h3>
                            <p>Add your first goal to get started on your journey!</p>
                        </div>
                    `;
            return;
        }

        let filteredTasks = tasks;

        // Apply filter
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        // Apply category filter
        if (currentCategory !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
        }

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="far fa-folder-open"></i>
                            <h3>No goals in this category</h3>
                            <p>Try changing your filter or add a new goal.</p>
                        </div>
                    `;
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.category} ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            const deadlineDate = task.deadline ? new Date(task.deadline) : null;
            const deadlineText = deadlineDate ?
                `Deadline: ${deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
                'No deadline set';

            // Check if deadline is approaching (within 3 days)
            const isDeadlineApproaching = deadlineDate &&
                !task.completed &&
                (deadlineDate - today) / (1000 * 60 * 60 * 24) <= 3;

            if (isDeadlineApproaching) {
                taskElement.style.borderLeftColor = '#e74c3c';
            }

            taskElement.innerHTML = `
                        <div class="task-content">
                            <div class="task-title">
                                <i class="fas ${getCategoryIcon(task.category)}"></i>
                                ${task.title}
                                ${isDeadlineApproaching ? '<i class="fas fa-exclamation-circle" style="color: #e74c3c; margin-left: 5px;"></i>' : ''}
                            </div>
                            <div class="task-desc">
                                ${task.description || 'No description provided'}
                            </div>
                            <div class="task-deadline">
                                <i class="far fa-calendar"></i> ${deadlineText}
                                ${isDeadlineApproaching ? '<span style="color: #e74c3c; margin-left: 5px;">(Approaching!)</span>' : ''}
                            </div>
                            <div class="task-meta">
                                <div class="task-category">${getCategoryName(task.category)}</div>
                                <div class="task-priority priority-${task.priority}">${task.priority} priority</div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="complete-btn">
                                <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'}" 
                                   style="${task.completed ? 'color: #2ecc71;' : ''}"></i>
                            </button>
                            <button class="edit-btn"><i class="far fa-edit"></i></button>
                            <button class="delete-btn"><i class="far fa-trash-alt"></i></button>
                        </div>
                    `;

            tasksContainer.appendChild(taskElement);
        });

        setupTaskActions();
    }

    // Render upcoming tasks for dashboard
    function renderUpcomingTasks() {
        upcomingTasksContainer.innerHTML = '';

        // Get tasks with deadlines that are not completed
        const upcomingTasks = tasks
            .filter(task => !task.completed && task.deadline)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5); // Show only 5 upcoming tasks

        if (upcomingTasks.length === 0) {
            upcomingTasksContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="far fa-calendar-check"></i>
                            <h3>No upcoming deadlines</h3>
                            <p>All your goals are either completed or don't have deadlines set.</p>
                        </div>
                    `;
            return;
        }

        upcomingTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.category}`;
            taskElement.dataset.id = task.id;

            const deadlineDate = new Date(task.deadline);
            const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
            let deadlineText = '';

            if (daysUntilDeadline === 0) {
                deadlineText = 'Due today!';
                taskElement.style.borderLeftColor = '#e74c3c';
            } else if (daysUntilDeadline === 1) {
                deadlineText = 'Due tomorrow!';
                taskElement.style.borderLeftColor = '#e74c3c';
            } else if (daysUntilDeadline < 0) {
                deadlineText = 'Overdue!';
                taskElement.style.borderLeftColor = '#e74c3c';
            } else {
                deadlineText = `Due in ${daysUntilDeadline} days`;
            }

            taskElement.innerHTML = `
                        <div class="task-content">
                            <div class="task-title">
                                <i class="fas ${getCategoryIcon(task.category)}"></i>
                                ${task.title}
                            </div>
                            <div class="task-desc">
                                ${task.description || 'No description provided'}
                            </div>
                            <div class="task-deadline">
                                <i class="far fa-calendar"></i> 
                                ${deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                                - <strong>${deadlineText}</strong>
                            </div>
                            <div class="task-meta">
                                <div class="task-category">${getCategoryName(task.category)}</div>
                                <div class="task-priority priority-${task.priority}">${task.priority} priority</div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="complete-btn">
                                <i class="far fa-circle"></i>
                            </button>
                        </div>
                    `;

            upcomingTasksContainer.appendChild(taskElement);
        });

        // Add event listeners for complete buttons in upcoming tasks
        const completeButtons = upcomingTasksContainer.querySelectorAll('.complete-btn');
        completeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const taskElement = this.closest('.task');
                const taskId = taskElement.dataset.id;
                const taskIndex = tasks.findIndex(t => t.id == taskId);

                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = new Date().toISOString();
                saveTasks();
                updateStats();
                renderUpcomingTasks();
                renderTasks();

                showNotification('Goal completed! Great job!');
                createConfetti();
            });
        });
    }

    // Helper function to get icon based on category
    function getCategoryIcon(category) {
        const icons = {
            'career': 'fa-briefcase',
            'learning': 'fa-graduation-cap',
            'project': 'fa-code-branch',
            'practice': 'fa-code'
        };
        return icons[category] || 'fa-tasks';
    }

    // Helper function to get category name
    function getCategoryName(category) {
        const names = {
            'career': 'Career Development',
            'learning': 'Learning',
            'project': 'Projects',
            'practice': 'Daily Practice'
        };
        return names[category] || 'Other';
    }

    // Setup task action buttons
    function setupTaskActions() {
        // Complete task functionality
        const completeButtons = document.querySelectorAll('.complete-btn');

        completeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const taskElement = this.closest('.task');
                const taskId = taskElement.dataset.id;
                const taskIndex = tasks.findIndex(t => t.id == taskId);

                tasks[taskIndex].completed = !tasks[taskIndex].completed;

                if (tasks[taskIndex].completed) {
                    tasks[taskIndex].completedDate = new Date().toISOString();
                    showNotification('Goal completed! Great job!');
                    createConfetti();
                } else {
                    tasks[taskIndex].completedDate = null;
                    showNotification('Goal marked as active.', false, true);
                }

                saveTasks();
                renderTasks();
                renderUpcomingTasks();
                updateStats();
            });
        });

        // Delete task functionality
        const deleteButtons = document.querySelectorAll('.delete-btn');

        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const taskElement = this.closest('.task');
                const taskId = taskElement.dataset.id;
                const taskIndex = tasks.findIndex(t => t.id == taskId);
                const taskTitle = tasks[taskIndex].title;

                taskElement.style.animation = 'fadeIn 0.5s reverse';

                setTimeout(() => {
                    tasks.splice(taskIndex, 1);
                    saveTasks();
                    renderTasks();
                    renderUpcomingTasks();
                    updateStats();
                    showNotification(`"${taskTitle}" deleted!`);
                }, 500);
            });
        });

        // Edit task functionality
        const editButtons = document.querySelectorAll('.edit-btn');

        editButtons.forEach(button => {
            button.addEventListener('click', function () {
                const taskElement = this.closest('.task');
                const taskId = taskElement.dataset.id;
                const taskIndex = tasks.findIndex(t => t.id == taskId);
                const task = tasks[taskIndex];

                // Replace task content with edit form
                const deadlineDate = task.deadline || '';

                taskElement.innerHTML = `
                            <div class="task-content" style="flex: 1;">
                                <div class="input-group" style="margin-bottom: 10px;">
                                    <input type="text" class="edit-task-title" value="${task.title}" style="flex: 1;">
                                </div>
                                <div class="input-group" style="margin-bottom: 10px;">
                                    <textarea class="edit-task-desc" style="flex: 1; min-height: 60px;">${task.description || ''}</textarea>
                                </div>
                                <div class="input-group" style="margin-bottom: 10px;">
                                    <select class="edit-task-category" style="flex: 1;">
                                        <option value="career" ${task.category === 'career' ? 'selected' : ''}>Career Development</option>
                                        <option value="learning" ${task.category === 'learning' ? 'selected' : ''}>Learning</option>
                                        <option value="project" ${task.category === 'project' ? 'selected' : ''}>Projects</option>
                                        <option value="practice" ${task.category === 'practice' ? 'selected' : ''}>Daily Practice</option>
                                    </select>
                                    <select class="edit-task-priority" style="flex: 1;">
                                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low Priority</option>
                                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High Priority</option>
                                    </select>
                                </div>
                                <div class="input-group" style="margin-bottom: 10px;">
                                    <input type="date" class="edit-task-deadline" value="${deadlineDate}" style="flex: 1;">
                                </div>
                            </div>
                            <div class="task-actions">
                                <button class="save-edit-btn"><i class="fas fa-save" style="color: #2ecc71;"></i></button>
                                <button class="cancel-edit-btn"><i class="fas fa-times" style="color: #e74c3c;"></i></button>
                            </div>
                        `;

                // Set up save and cancel buttons
                const saveButton = taskElement.querySelector('.save-edit-btn');
                const cancelButton = taskElement.querySelector('.cancel-edit-btn');

                saveButton.addEventListener('click', function () {
                    const updatedTitle = taskElement.querySelector('.edit-task-title').value.trim();
                    const updatedDesc = taskElement.querySelector('.edit-task-desc').value.trim();
                    const updatedCategory = taskElement.querySelector('.edit-task-category').value;
                    const updatedPriority = taskElement.querySelector('.edit-task-priority').value;
                    const updatedDeadline = taskElement.querySelector('.edit-task-deadline').value;

                    if (updatedTitle === '') {
                        showNotification('Goal title cannot be empty!', true);
                        return;
                    }

                    tasks[taskIndex].title = updatedTitle;
                    tasks[taskIndex].description = updatedDesc;
                    tasks[taskIndex].category = updatedCategory;
                    tasks[taskIndex].priority = updatedPriority;
                    tasks[taskIndex].deadline = updatedDeadline;

                    saveTasks();
                    renderTasks();
                    renderUpcomingTasks();
                    showNotification('Goal updated successfully!');
                });

                cancelButton.addEventListener('click', function () {
                    renderTasks();
                });
            });
        });
    }

    // Add new task functionality
    addTaskBtn.addEventListener('click', addNewTask);

    function addNewTask() {
        const title = newTaskTitle.value.trim();
        const description = newTaskDesc.value.trim();
        const category = newTaskCategory.value;
        const deadline = newTaskDeadline.value;
        const priority = newTaskPriority.value;

        if (title === '') {
            showNotification('Please enter a goal title!', true);
            return;
        }

        const newTask = {
            id: Date.now(),
            title: title,
            description: description,
            category: category,
            priority: priority,
            deadline: deadline,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        renderUpcomingTasks();
        updateStats();

        // Reset form
        newTaskTitle.value = '';
        newTaskDesc.value = '';
        newTaskDeadline.value = '';
        newTaskPriority.value = 'medium';

        showNotification('New goal added successfully!');

        // Switch to goals tab after adding
        switchTab('goals');
    }

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentFilter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            renderTasks();
        });
    });

    // Category filter functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentCategory = this.getAttribute('data-category');

            // Update active category
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update mobile category selector
            mobileCategorySelector.value = currentCategory;

            renderTasks();
        });
    });

    // Mobile category selector functionality
    mobileCategorySelector.addEventListener('change', function () {
        currentCategory = this.value;

        // Update active category in sidebar
        categoryButtons.forEach(btn => {
            if (btn.dataset.category === currentCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        renderTasks();
    });

    // Tab switching functionality
    function switchTab(tabName) {
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Update mobile bottom navigation
        mobileNavItems.forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Mobile bottom navigation functionality
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Mobile menu toggle
    mobileNavToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Mobile back button functionality
    mobileBackBtn.addEventListener('click', function () {
        sidebar.classList.remove('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (event) {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnMenuButton = mobileNavToggle.contains(event.target);

            if (!isClickInsideSidebar && !isClickOnMenuButton && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Allow adding task with Enter key
    newTaskTitle.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });

    // Initialize the app
    updateStreak();
    showRandomQuote();
    updateStats();
    renderTasks();
    renderUpcomingTasks();
});