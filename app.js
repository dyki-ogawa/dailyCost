// カテゴリマスタ
const CATEGORIES = [
    { id: 'drink', name: '飲物', icon: '🥤' },
    { id: 'food', name: '食費', icon: '🍱' },
    { id: 'transport', name: '交通費', icon: '🚃' },
    { id: 'shopping', name: '買い物', icon: '🛍️' },
    { id: 'entertainment', name: '娯楽', icon: '🎮' },
    { id: 'utility', name: '光熱費', icon: '💡' },
    { id: 'health', name: '医療', icon: '🏥' },
    { id: 'other', name: 'その他', icon: '📝' }
];

// グローバル変数
let chart = null;
let expenses = [];

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

// カテゴリの選択肢を設定
function setupCategoryOptions() {
    const categorySelect = document.getElementById('category');
    CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option);
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
}

// モーダルを開く
function openModal() {
    document.getElementById('addExpenseModal').classList.add('show');
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('addExpenseModal').classList.remove('show');
    document.getElementById('expenseForm').reset();
}

// フォーム送信処理
function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const expense = {
        id: Date.now(),
        date: new Date().toISOString(),
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
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayStr = dayNames[today.getDay()];

    document.getElementById('dateDisplay').textContent = `${dateStr}(${dayStr})`;
}

// 今日の合計を更新
function updateTodayTotal() {
    const today = new Date().toDateString();
    const todayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date).toDateString();
        return expDate === today;
    });

    const total = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('todayTotal').textContent = `¥${total.toLocaleString()}`;
}

// 支出一覧を更新
function updateExpensesList() {
    const today = new Date().toDateString();
    const todayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date).toDateString();
        return expDate === today;
    });

    const listContainer = document.getElementById('expensesList');
    const emptyMessage = document.getElementById('emptyMessage');

    if (todayExpenses.length === 0) {
        listContainer.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    listContainer.innerHTML = todayExpenses.map(exp => createExpenseCard(exp)).join('');
}

// 支出カードのHTMLを生成
function createExpenseCard(expense) {
    const category = CATEGORIES.find(cat => cat.id === expense.category);
    const time = new Date(expense.date).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="expense-card">
            <div class="expense-card-header">
                <div class="category-icon">${category.icon}</div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="expense-time">${time}</div>
                </div>
                <div class="expense-amount">¥${expense.amount.toLocaleString()}</div>
            </div>
            ${expense.memo ? `<div class="expense-memo">${expense.memo}</div>` : ''}
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
                borderColor: '#00B4DB',
                backgroundColor: 'rgba(0, 180, 219, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#00B4DB',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
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
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
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

    // 今日の日付のポイントを強調
    const todayIndex = weekData.labels.findIndex(label => label.includes('今日'));
    chart.data.datasets[0].pointRadius = weekData.labels.map((_, i) => i === todayIndex ? 8 : 4);
    chart.data.datasets[0].pointBackgroundColor = weekData.labels.map((_, i) =>
        i === todayIndex ? '#fff' : '#00B4DB'
    );
    chart.data.datasets[0].pointBorderColor = weekData.labels.map((_, i) =>
        i === todayIndex ? '#00B4DB' : '#fff'
    );
    chart.data.datasets[0].pointBorderWidth = weekData.labels.map((_, i) =>
        i === todayIndex ? 3 : 2
    );

    chart.update();
}

// 週間データを取得（月曜始まり）
function getWeekData() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0:日曜, 1:月曜, ..., 6:土曜

    // 月曜日を週の開始とする
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const labels = [];
    const amounts = [];
    const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        const dateStr = date.toDateString();
        const isToday = dateStr === today.toDateString();

        // ラベル作成
        const label = isToday ? `${dayNames[i]}(今日)` : dayNames[i];
        labels.push(label);

        // その日の支出合計を計算
        const dayExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date).toDateString();
            return expDate === dateStr;
        });

        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        amounts.push(total);
    }

    return { labels, amounts };
}
