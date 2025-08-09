const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

class ChatroomDB {
    constructor() {
        // Create database file in the project directory
        const dbPath = path.join(__dirname, 'chatroom.db');
        this.db = new Database(dbPath);
        this.initTables();
    }

    initTables() {
        // Create users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        `;

        // Create sessions table for future use
        const createSessionsTable = `
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        this.db.exec(createUsersTable);
        this.db.exec(createSessionsTable);
        
        console.log('Database tables initialized successfully');
    }

    // Register a new user
    async createUser(name, password) {
        if (!name || !password) {
            throw new Error('Name and password are required');
        }

        // Check if user already exists
        const existingUser = this.getUser(name);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const insertUser = this.db.prepare(`
            INSERT INTO users (name, password) 
            VALUES (?, ?)
        `);

        try {
            const result = insertUser.run(name, hashedPassword);
            return {
                id: result.lastInsertRowid,
                name: name,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new Error('User already exists');
            }
            throw error;
        }
    }

    // Get user by name
    getUser(name) {
        const getUser = this.db.prepare('SELECT * FROM users WHERE name = ?');
        return getUser.get(name);
    }

    // Authenticate user
    async authenticateUser(name, password) {
        if (!name || !password) {
            throw new Error('Name and password are required');
        }

        const user = this.getUser(name);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Update last login timestamp
        const updateLoginTime = this.db.prepare(`
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        updateLoginTime.run(user.id);

        // Return user data without password
        return {
            id: user.id,
            name: user.name,
            created_at: user.created_at,
            last_login: user.last_login
        };
    }

    // Get all users with their details
    getAllUsers() {
        const stmt = this.db.prepare(`
            SELECT id, name, created_at, last_login 
            FROM users 
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }

    // Get user count
    getUserCount() {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
        return stmt.get().count;
    }

    // Delete user by ID
    deleteUser(id) {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // Delete user by name
    deleteUserByName(name) {
        const stmt = this.db.prepare('DELETE FROM users WHERE name = ?');
        const result = stmt.run(name);
        return result.changes > 0;
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = ChatroomDB;
