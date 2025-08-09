document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refresh-btn');
    const exportBtn = document.getElementById('export-btn');
    const clearOldBtn = document.getElementById('clear-old-btn');
    const totalUsersEl = document.getElementById('total-users');
    const recentLoginsEl = document.getElementById('recent-logins');
    const newUsersEl = document.getElementById('new-users');
    const usersTableBody = document.getElementById('users-tbody');

    // Load data on page load
    loadUserData();

    // Refresh button
    refreshBtn.addEventListener('click', () => {
        refreshBtn.textContent = '🔄 Loading...';
        refreshBtn.disabled = true;
        loadUserData().finally(() => {
            refreshBtn.textContent = '🔄 Refresh Data';
            refreshBtn.disabled = false;
        });
    });

    // Export button
    exportBtn.addEventListener('click', exportUserData);

    // Clear old sessions button
    clearOldBtn.addEventListener('click', clearOldSessions);

    async function loadUserData() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            // Update stats
            totalUsersEl.textContent = data.totalUsers;
            
            // Calculate recent logins (last 24 hours)
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            let recentLogins = 0;
            let newUsers = 0;

            data.users.forEach(user => {
                if (user.last_login) {
                    const lastLogin = new Date(user.last_login);
                    if (lastLogin > yesterday) {
                        recentLogins++;
                    }
                }
                
                const createdAt = new Date(user.created_at);
                if (createdAt > yesterday) {
                    newUsers++;
                }
            });

            recentLoginsEl.textContent = recentLogins;
            newUsersEl.textContent = newUsers;

            // Update users table
            updateUsersTable(data.users);

        } catch (error) {
            console.error('Failed to load user data:', error);
            usersTableBody.innerHTML = '<tr><td colspan="4" class="no-data">Failed to load user data</td></tr>';
        }
    }

    function updateUsersTable(users) {
        if (users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No users registered yet</td></tr>';
            return;
        }

        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        usersTableBody.innerHTML = users.map(user => {
            const createdAt = new Date(user.created_at);
            const lastLogin = user.last_login ? new Date(user.last_login) : null;
            
            // Determine status (online if logged in within last 5 minutes)
            const isOnline = lastLogin && lastLogin > fiveMinutesAgo;
            const statusClass = isOnline ? 'status-online' : 'status-offline';
            const statusText = isOnline ? 'Online' : 'Offline';

            return `
                <tr>
                    <td><strong>${escapeHtml(user.name)}</strong></td>
                    <td>${formatDate(createdAt)}</td>
                    <td>${lastLogin ? formatDate(lastLogin) : 'Never'}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    }

    function formatDate(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function exportUserData() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + "Name,Created At,Last Login\n"
                + data.users.map(user => 
                    `"${user.name}","${user.created_at}","${user.last_login || 'Never'}"`
                ).join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `chatroom_users_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('User data exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            showNotification('Failed to export user data', 'error');
        }
    }

    function clearOldSessions() {
        if (confirm('Are you sure you want to clear old session data? This action cannot be undone.')) {
            // For now, just show a message since we don't have a backend endpoint for this
            showNotification('Session cleanup feature coming soon!', 'info');
        }
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        const colors = {
            success: 'linear-gradient(135deg, #48bb78, #38a169)',
            error: 'linear-gradient(135deg, #f56565, #e53e3e)',
            info: 'linear-gradient(135deg, #667eea, #764ba2)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Auto-refresh every 30 seconds
    setInterval(loadUserData, 30000);
});
