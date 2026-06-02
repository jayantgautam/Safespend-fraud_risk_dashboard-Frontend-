// Base URL for API
const API_BASE = 'http://127.0.0.1:5000/api';

// Global state
let currentPage = 1;
let currentTransactions = [];
let riskChartInstance = null;
let categoryChartInstance = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Fraud Detection Dashboard Initialized');
    initializeDashboard();
});

async function initializeDashboard() {
    await loadSummaryData();
    await loadTransactions();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#3b82f6';
        uploadArea.style.backgroundColor = '#f0f9ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#cbd5e1';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#cbd5e1';
        uploadArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

// Upload file to backend
async function handleFileUpload(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    showLoading(true);

    try {
        console.log('📤 Uploading file...');
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('📤 Upload response:', data);

        if (response.ok) {
            showToast(`✅ Successfully processed ${data.total_transactions} transactions`, 'success');
            // Wait a bit for database to update, then reload data
            setTimeout(async () => {
                await loadSummaryData();
                await loadTransactions();
            }, 1000);
        } else {
            showToast(`❌ Upload failed: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast(`❌ Upload error: ${error.message}`, 'error');
        console.error('Upload error:', error);
    } finally {
        showLoading(false);
    }
}

// Load summary data for dashboard
async function loadSummaryData() {
    try {
        console.log('📊 Loading summary data...');
        const response = await fetch(`${API_BASE}/transactions/summary`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Summary data received:', data);

        // Update the dashboard with the received data
        updateDashboard(data);
        updateCharts(data);
        
    } catch (error) {
        console.error('❌ Error loading summary:', error);
        // Initialize with empty data if endpoint fails
        updateDashboard({
            total_transactions: 0,
            high_risk_count: 0,
            risk_distribution: { high: 0, medium: 0, low: 0 }
        });
        updateCharts({
            risk_distribution: { high: 0, medium: 0, low: 0 },
            amount_by_category: {}
        });
    }
}

// Update dashboard cards - FIXED VERSION
function updateDashboard(data) {
    console.log('🎯 Updating dashboard with:', data);
    
    const total = data.total_transactions || 0;
    const highRisk = data.high_risk_count || 0;
    const riskDist = data.risk_distribution || { high: 0, medium: 0, low: 0 };
    
    // Use the risk distribution data directly
    const mediumRisk = riskDist.medium || 0;
    const lowRisk = riskDist.low || 0;

    console.log(`🎯 Cards - Total: ${total}, High: ${highRisk}, Medium: ${mediumRisk}, Low: ${lowRisk}`);

    // Update the HTML elements
    document.getElementById('total-transactions').textContent = total;
    document.getElementById('high-risk-count').textContent = highRisk;
    document.getElementById('medium-risk-count').textContent = mediumRisk;
    document.getElementById('low-risk-count').textContent = lowRisk;
    
    // Force a visual update
    document.querySelectorAll('.card h3').forEach(el => {
        el.style.color = '#1e293b';
    });
}

// Update charts - FIXED VERSION
function updateCharts(data) {
    console.log('📈 Updating charts with:', data);
    
    const riskDist = data.risk_distribution || { high: 0, medium: 0, low: 0 };
    const categoryData = data.amount_by_category || {};

    // Update Risk Distribution Chart
    updateRiskChart(riskDist);
    
    // Update Category Chart
    updateCategoryChart(categoryData);
}

function updateRiskChart(riskDist) {
    const riskCtx = document.getElementById('riskChart');
    
    // Destroy previous chart if it exists
    if (riskChartInstance) {
        riskChartInstance.destroy();
    }
    
    riskChartInstance = new Chart(riskCtx, {
        type: 'doughnut',
        data: {
            labels: ['High Risk', 'Medium Risk', 'Low Risk'],
            datasets: [{
                data: [
                    riskDist.high || 0,
                    riskDist.medium || 0, 
                    riskDist.low || 0
                ],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateCategoryChart(categoryData) {
    const categoryCtx = document.getElementById('categoryChart');
    
    // Destroy previous chart if it exists
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }
    
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    categoryChartInstance = new Chart(categoryCtx, {
        type: 'bar',
        data: {
            labels: categories.length > 0 ? categories : ['No Data'],
            datasets: [{
                label: 'Amount ($)',
                data: amounts.length > 0 ? amounts : [0],
                backgroundColor: '#3b82f6',
                borderColor: '#1d4ed8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Load transactions for table
async function loadTransactions(page = 1) {
    try {
        const response = await fetch(`${API_BASE}/transactions?page=${page}&per_page=10`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 Transactions data received:', data);

        if (data && data.transactions) {
            currentTransactions = data.transactions;
            currentPage = page;
            renderTransactions(currentTransactions);
            updatePagination(data);
        }
    } catch (error) {
        console.error('❌ Error loading transactions:', error);
        renderTransactions([]);
    }
}

// Render transactions in table
function renderTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">No transactions found. Upload a CSV file to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.transaction_id || 'N/A'}</td>
            <td>$${parseFloat(transaction.amount || 0).toFixed(2)}</td>
            <td>${transaction.customer_id || 'N/A'}</td>
            <td>${transaction.merchant || 'N/A'}</td>
            <td>${parseFloat(transaction.fraud_risk_score || 0).toFixed(3)}</td>
            <td>
                <span class="risk-badge risk-${transaction.risk_category || 'low'}">
                    ${transaction.risk_category || 'low'}
                </span>
            </td>
            <td>${transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-sm" onclick="viewTransaction(${transaction.id})">
                    View Details
                </button>
            </td>
        </tr>
    `).join('');
}

// Update pagination controls
function updatePagination(data) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    const totalPages = data.pages || 1;
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Change page
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage > 0) {
        loadTransactions(newPage);
    }
}

// Filter transactions
function filterTransactions() {
    const riskFilter = document.getElementById('riskFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = currentTransactions;
    
    if (riskFilter !== 'all') {
        filtered = filtered.filter(t => t.risk_category === riskFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(t => 
            (t.transaction_id && t.transaction_id.toLowerCase().includes(searchTerm)) ||
            (t.customer_id && t.customer_id.toLowerCase().includes(searchTerm)) ||
            (t.merchant && t.merchant.toLowerCase().includes(searchTerm))
        );
    }
    
    renderTransactions(filtered);
}

// View transaction details
function viewTransaction(id) {
    const transaction = currentTransactions.find(t => t.id === id);
    if (transaction) {
        alert(`Transaction Details:\n\n` +
              `ID: ${transaction.transaction_id}\n` +
              `Amount: $${transaction.amount}\n` +
              `Customer: ${transaction.customer_id}\n` +
              `Merchant: ${transaction.merchant}\n` +
              `Risk Score: ${transaction.fraud_risk_score}\n` +
              `Risk Category: ${transaction.risk_category}\n` +
              `Date: ${new Date(transaction.transaction_date).toLocaleDateString()}\n` +
              `Category: ${transaction.category || 'N/A'}\n` +
              `Location: ${transaction.location || 'N/A'}`);
    }
}

// Clear all data
async function clearAllData() {
    if (!confirm('Are you sure you want to clear all transaction data? This action cannot be undone.')) {
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/clear`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`✅ ${data.message}`, 'success');
            // Reload empty data
            await loadSummaryData();
            await loadTransactions();
        } else {
            showToast(`❌ Clear failed: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast(`❌ Clear error: ${error.message}`, 'error');
        console.error('Clear error:', error);
    } finally {
        showLoading(false);
    }
}

// Modified upload function with clear option
async function handleFileUpload(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Check if we should clear existing data
    const clearExisting = document.getElementById('clearExisting').checked;
    if (clearExisting) {
        formData.append('clear_existing', 'true');
    }

    showLoading(true);

    try {
        console.log('📤 Uploading file...', clearExisting ? '(will clear existing data)' : '(will append data)');
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`✅ ${data.message}`, 'success');
            // Reload data
            await loadSummaryData();
            await loadTransactions();
        } else {
            showToast(`❌ Upload failed: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast(`❌ Upload error: ${error.message}`, 'error');
        console.error('Upload error:', error);
    } finally {
        showLoading(false);
    }
}
// Export functions
async function exportCSV() {
    try {
        const response = await fetch(`${API_BASE}/export/csv`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fraud_report.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('CSV export started', 'success');
        } else {
            const error = await response.json();
            showToast(`Export failed: ${error.error}`, 'error');
        }
    } catch (error) {
        showToast('Export failed: ' + error.message, 'error');
        console.error('Export error:', error);
    }
}

async function exportPDF() {
    try {
        const response = await fetch(`${API_BASE}/export/pdf`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fraud_report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('PDF export started', 'success');
        } else {
            const error = await response.json();
            showToast(`Export failed: ${error.error}`, 'error');
        }
    } catch (error) {
        showToast('Export failed: ' + error.message, 'error');
        console.error('Export error:', error);
    }
}

function exportHTML() {
    exportPDF(); // Use PDF for HTML export for now
}

// Utility functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = 'block';
    
    // Add background color based on type
    if (type === 'success') {
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        toast.style.background = '#ef4444';
    } else {
        toast.style.background = '#3b82f6';
    }
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

// Add CSS for proper styling
const style = document.createElement('style');
style.textContent = `
    .risk-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    .risk-high { background: #fecaca; color: #dc2626; }
    .risk-medium { background: #fed7aa; color: #ea580c; }
    .risk-low { background: #bbf7d0; color: #16a34a; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
    
    .chart-container {
        height: 400px;
        position: relative;
    }
    
    .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
    
    .card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .card h3 {
        font-size: 2rem;
        margin-bottom: 0.25rem;
        color: #1e293b;
    }
`;
document.head.appendChild(style);