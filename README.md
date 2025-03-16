# WebApp

## 1. Description of the Application
The application aims to provide a social platform where users can engage in discussions, share thoughts, and connect with others. It facilitates user interactions through features like creating and viewing posts, commenting, and exploring community-generated content.

### 1.1 Purpose of the System
The primary goal is to foster communication and interaction among users, ensuring a secure environment. Key features include user registration, authentication, and authorization. Users can manage their profiles, posts, and comments. The system promotes community building by connecting users with shared interests.

### 1.2 Functional Requirements
#### Unregistered Users
1. View the home page of posts and comments with authors.
2. Go to the login page and register for the online application.

#### Registered Users
1. Log in and log out.
2. View other users and their profiles.
3. Edit and delete their profiles.
4. View and interact with posts and comments.
5. Create, edit, and delete their posts and comments.

#### Admin
1. Log in and log out.
2. View other users and their profiles.
3. Edit and delete all profiles.
4. View and manage all posts and comments.

## 2. System Architecture
### System Components
- **Client side (Front-End):** React.js
- **Server side (Back-End):** Python Flask framework and SQLAlchemy library for SQLite database connectivity.

## 3. Setting Up and Running the Application

### 3.1 Prerequisites
- Node.js and npm installed
- Python 3.x installed
- Virtual environment tool (e.g., `venv`)

### 3.2 Setting Up the Backend
1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Create and activate a virtual environment:
    ```sh
    python -m venv .venv
    ./.venv/Scripts/activate  # On Linux use `source venv/bin/activate`
    ```

3. Install the required Python packages:
    ```sh
    pip install -r requirements.txt
    ```

4. Set up the database:
    ```sh
    flask db init
    ```
    ```sh
    flask db migrate
    ```
    ```sh
    flask db upgrade
    ```

4. Run the Flask application and populate the database:
    ```sh
    flask populate_db
    ```
    ```sh
    flask run
    ```

### 3.3 Setting Up the Frontend
1. Navigate to the `client` directory:
    ```sh
    cd client
    ```

2. Install the required npm packages:
    ```sh
    npm install
    ```

3. Start the React development server:
    ```sh
    npm start
    ```

### 3.4 Accessing the Application
- The backend server will be running at \`http://localhost:5000\`
- The frontend server will be running at \`http://localhost:3000\`
- The database will be populated with random users, posts, and comments.