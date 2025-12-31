// カテゴリマスタ
const CATEGORIES = [
    { id: 'food', name: '飲食', icon: '🍱' },
    { id: 'daily', name: '日用品', icon: '🪥' },
    { id: 'hobby', name: '趣味', icon: '🤹' },
    { id: 'books', name: '書籍', icon: '📚' },
    { id: 'social', name: '交際費', icon: '🍻' },
    { id: 'transport', name: '交通費', icon: '🚃' },
    { id: 'health', name: '医療', icon: '🏥' },
    { id: 'other', name: 'その他', icon: '📝' }
];

// グローバル変数
let chart = null;
let expenses = [];
let currentDate = new Date(); // 現在表示している日付

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// アプリの初期化
function initApp() {
    loadExpenses();
    setupCategoryOptions();
    setupEventListeners();
    updateDisplay();
    initChart();
}

// LocalStorageから支出データを読み込み
function loadExpenses() {
    const stored = localStorage.getItem('expenses');
    expenses = stored ? JSON.parse(stored) : [];
}

// LocalStorageに支出データを保存
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// カテゴリボタンを設定
function setupCategoryOptions() {
    const categoryContainer = document.getElementById('categoryButtons');
    const categoryInput = document.getElementById('category');

    CATEGORIES.forEach((cat, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn';
        button.dataset.categoryId = cat.id;

        button.innerHTML = `
            <div class="category-btn-icon">${cat.icon}</div>
            <div class="category-btn-name">${cat.name}</div>
        `;

        // クリックイベント
        button.addEventListener('click', () => {
            // 全てのボタンから選択状態を削除
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // クリックされたボタンを選択状態に
            button.classList.add('selected');
            categoryInput.value = cat.id;
        });

        categoryContainer.appendChild(button);

        // デフォルトで最初のカテゴリ（左上）を選択
        if (index === 0) {
            button.classList.add('selected');
            categoryInput.value = cat.id;
        }
    });
}

// イベントリスナーの設定
function setupEventListeners() {
    // FABボタン
    document.getElementById('fabBtn').addEventListener('click', openModal);

    // モーダルを閉じる
    document.getElementById('closeModal').addEventListener('click', closeModal);

    // モーダルの背景クリックで閉じる
    document.getElementById('addExpenseModal').addEventListener('click', (e) => {
        if (e.target.id === 'addExpenseModal') {
            closeModal();
        }
    });

    // フォーム送信
    document.getElementById('expenseForm').addEventListener('submit', handleSubmit);

    // 編集モーダルを閉じる
    document.getElementById('closeEditModal').addEventListener('click', closeEditModal);

    // 編集モーダルの背景クリックで閉じる
    document.getElementById('editExpenseModal').addEventListener('click', (e) => {
        if (e.target.id === 'editExpenseModal') {
            closeEditModal();
        }
    });

    // 編集フォーム送信
    document.getElementById('editExpenseForm').addEventListener('submit', handleEditSubmit);

    // 削除ボタン
    document.getElementById('deleteExpenseBtn').addEventListener('click', handleDelete);

    // 日付ナビゲーション
    document.getElementById('prevDayBtn').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDisplay();
    });

    document.getElementById('nextDayBtn').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDisplay();
    });
}

// モーダルを開く
function openModal() {
    document.getElementById('addExpenseModal').classList.add('show');
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('addExpenseModal').classList.remove('show');
    document.getElementById('expenseForm').reset();

    // カテゴリボタンをリセット（最初のカテゴリを選択状態に）
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach((btn, index) => {
        if (index === 0) {
            btn.classList.add('selected');
            document.getElementById('category').value = CATEGORIES[0].id;
        } else {
            btn.classList.remove('selected');
        }
    });
}

// フォーム送信処理
function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // 現在表示している日付で支出を作成
    const expenseDate = new Date(currentDate);
    expenseDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

    const expense = {
        id: Date.now(),
        date: expenseDate.toISOString(),
        amount: parseInt(formData.get('amount')),
        category: formData.get('category'),
        memo: formData.get('memo') || ''
    };

    expenses.unshift(expense); // 最新を先頭に
    saveExpenses();
    updateDisplay();
    closeModal();
}

// 表示を更新
function updateDisplay() {
    updateDateDisplay();
    updateTodayTotal();
    updateExpensesList();
    updateChart();
}

// 日付表示を更新
function updateDateDisplay() {
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    document.getElementById('dateDisplay').textContent = `${month}/${day}`;
}

// 選択日の合計を更新
function updateTodayTotal() {
    const selectedDate = currentDate.toDateString();
    const dayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date).toDateString();
        return expDate === selectedDate;
    });

    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    document.getElementById('todayTotal').textContent = `¥${total.toLocaleString()}`;
}

// 支出一覧を更新
function updateExpensesList() {
    const selectedDate = currentDate.toDateString();
    const dayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date).toDateString();
        return expDate === selectedDate;
    });

    const listContainer = document.getElementById('expensesList');
    const emptyMessage = document.getElementById('emptyMessage');

    if (dayExpenses.length === 0) {
        listContainer.innerHTML = '';
        listContainer.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    listContainer.style.display = 'block';
    listContainer.innerHTML = dayExpenses.map(exp => createExpenseItem(exp)).join('');

    // 各支出アイテムにクリックイベントを追加
    document.querySelectorAll('.expense-item').forEach(item => {
        item.addEventListener('click', () => {
            const expenseId = parseInt(item.dataset.expenseId);
            openEditModal(expenseId);
        });
    });
}

// 支出アイテムのHTMLを生成
function createExpenseItem(expense) {
    const category = CATEGORIES.find(cat => cat.id === expense.category);

    // メモがあればメモを表示、なければカテゴリ名を表示
    const displayText = expense.memo || category.name;

    return `
        <div class="expense-item" data-expense-id="${expense.id}" style="cursor: pointer;">
            <div class="category-icon">${category.icon}</div>
            <div class="expense-info">
                <div class="category-name">${displayText}</div>
            </div>
            <div class="expense-amount">${expense.amount.toLocaleString()}</div>
        </div>
    `;
}

// グラフの初期化
function initChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '支出額',
                data: [],
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'transparent',
                tension: 0.4,
                fill: false,
                pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
                pointBorderColor: 'rgba(255, 255, 255, 0.3)',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return '¥' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });

    updateChart();
}

// グラフを更新
function updateChart() {
    if (!chart) return;

    const weekData = getWeekData();

    chart.data.labels = weekData.labels;
    chart.data.datasets[0].data = weekData.amounts;

    // 今日の日付のポイントを強調（白い丸）
    const todayIndex = weekData.todayIndex;
    chart.data.datasets[0].pointRadius = weekData.labels.map((_, i) => i === todayIndex ? 9 : 5);
    chart.data.datasets[0].pointBackgroundColor = weekData.labels.map((_, i) =>
        i === todayIndex ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)'
    );
    chart.data.datasets[0].pointBorderColor = weekData.labels.map((_, i) =>
        i === todayIndex ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'
    );
    chart.data.datasets[0].pointBorderWidth = weekData.labels.map((_, i) =>
        i === todayIndex ? 4 : 3
    );

    chart.update();
}

// 週間データを取得（日曜始まり）
function getWeekData() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0:日曜, 1:月曜, ..., 6:土曜

    // 日曜日を週の開始とする
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const labels = [];
    const amounts = [];
    const dayNames = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
    let todayIndex = -1;

    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);

        const dateStr = date.toDateString();
        const isToday = dateStr === today.toDateString();

        if (isToday) {
            todayIndex = i;
        }

        // ラベル作成（シンプルに曜日名のみ）
        labels.push(dayNames[i]);

        // その日の支出合計を計算
        const dayExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date).toDateString();
            return expDate === dateStr;
        });

        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        amounts.push(total);
    }

    return { labels, amounts, todayIndex };
}

// 編集用カテゴリボタンを設定
function setupEditCategoryOptions() {
    const categoryContainer = document.getElementById('editCategoryButtons');
    const categoryInput = document.getElementById('editCategory');

    // 既存のボタンをクリア
    categoryContainer.innerHTML = '';

    CATEGORIES.forEach((cat) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn';
        button.dataset.categoryId = cat.id;

        button.innerHTML = `
            <div class="category-btn-icon">${cat.icon}</div>
            <div class="category-btn-name">${cat.name}</div>
        `;

        // クリックイベント
        button.addEventListener('click', () => {
            // 全てのボタンから選択状態を削除
            categoryContainer.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // クリックされたボタンを選択状態に
            button.classList.add('selected');
            categoryInput.value = cat.id;
        });

        categoryContainer.appendChild(button);
    });
}

// 編集モーダルを開く
function openEditModal(expenseId) {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense) return;

    // 編集用カテゴリボタンを設定
    setupEditCategoryOptions();

    // フォームに値を設定
    document.getElementById('editExpenseId').value = expense.id;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editCategory').value = expense.category;
    document.getElementById('editMemo').value = expense.memo;

    // カテゴリボタンの選択状態を設定
    document.querySelectorAll('#editCategoryButtons .category-btn').forEach(btn => {
        if (btn.dataset.categoryId === expense.category) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    // モーダルを表示
    document.getElementById('editExpenseModal').classList.add('show');
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('editExpenseModal').classList.remove('show');
    document.getElementById('editExpenseForm').reset();
}

// 編集フォーム送信処理
function handleEditSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const expenseId = parseInt(document.getElementById('editExpenseId').value);

    // 支出を検索して更新
    const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex !== -1) {
        expenses[expenseIndex].amount = parseInt(formData.get('amount'));
        expenses[expenseIndex].category = formData.get('category');
        expenses[expenseIndex].memo = formData.get('memo') || '';

        saveExpenses();
        updateDisplay();
        closeEditModal();
    }
}

// 支出を削除
function handleDelete() {
    const expenseId = parseInt(document.getElementById('editExpenseId').value);

    if (confirm('この支出を削除しますか？')) {
        expenses = expenses.filter(exp => exp.id !== expenseId);
        saveExpenses();
        updateDisplay();
        closeEditModal();
    }
}
