# Real-time Collaborative Markdown Editor

## Project Overview

This project is a **real-time collaborative Markdown editor** that allows multiple users to edit and view documents simultaneously. Built with a **WebSocket-based live editing system**, it ensures that updates are instantly reflected across all users connected to the same document. The platform includes **role-based access control (RBAC)**, enabling document owners to assign permissions to collaborators as either **editors** (who can modify the document) or **viewers** (who can only view it). This tool is ideal for **teams, writers, and developers** who need to work together in real-time on shared documents.

## Features

- **Real-time Collaboration**: Users can edit documents simultaneously, with updates synced instantly across all users.
- **Role-based Access Control (RBAC)**: Document owners can assign permissions for editors and viewers.
- **Live Markdown Rendering**: Edits are reflected in real-time, with Markdown parsing and rendering for previewing formatted content.
- **Document History**: Track recent document edits and users' activity.
- **Responsive UI/UX**: A user-friendly and intuitive interface built for collaboration.
- **Secure Authentication**: JWT-based authentication system ensures that only authorized users can access and modify documents.

## Technologies Used

- **Frontend**: 
  - **React.js**: For building the interactive and real-time editing interface.
- **Backend**:
  - **Ruby on Rails**: Provides the core backend, managing APIs, document handling, user authentication, and role-based permissions.
- **Database**: 
  - **PostgreSQL**: Stores user data, document content, and permission settings with scalability and consistency.
- **Real-time Collaboration**: 
  - **WebSockets**: Used for synchronizing document changes between users in real-time.
- **Authentication & Authorization**: 
  - **JWT (JSON Web Tokens)**: Manages user authentication and authorization for secure access control.
- **Markdown Processing**: 
  - **Marked.js**: Enables real-time parsing and rendering of Markdown content.
- **Version Control**: 
  - **Git & GitHub**: Tracks changes in the codebase and allows collaborative development.
- **Containerization & Deployment**: 
  - **Docker**: Ensures consistency between development and production environments for deployment.

## Installation

### Prerequisites

- **Node.js** (v12.22.9 or higher)
- **Ruby on Rails** (v6 or higher)
- **PostgreSQL** (v12 or higher)
- **Docker** (for containerization)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Backend Setup**:
   - Install dependencies:
     ```bash
     bundle install
     ```
   - Set up the database:
     ```bash
     rails db:create db:migrate
     ```
   - Run the Rails server:
     ```bash
     rails s
     ```

3. **Frontend Setup**:
   - Navigate to the `client` directory:
     ```bash
     cd client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run the React development server:
     ```bash
     npm start
     ```

4. **Running the Application**:
   - The backend will run on `http://localhost:3000`.
   - The frontend will run on `http://localhost:3001`.

5. **Docker Setup** (Optional):
   - Build and run the Docker containers:
     ```bash
     docker-compose up --build
     ```

## Usage

1. **Sign up/Login**: New users can sign up or log in to access the platform.
2. **Create Documents**: Create a new Markdown document from the dashboard.
3. **Invite Collaborators**: Assign roles to other users (editors or viewers) to collaborate on documents.
4. **Collaborate**: Edit the document in real-time, with changes reflected instantly across all users.

## API Endpoints

### Document Routes

- **GET** `/api/documents`: Fetch all documents.
- **GET** `/api/documents/:id`: Fetch a specific document by ID.
- **POST** `/api/documents`: Create a new document.
- **PATCH** `/api/documents/:id`: Update a document.
- **DELETE** `/api/documents/:id`: Delete a document.

### User Routes

- **GET** `/api/user/activity`: Fetch user activity (documents created/shared).
- **GET** `/api/user/documents/recent`: Fetch recent documents for the current user.

## Real-time Collaboration

- **WebSockets** are used for real-time synchronization, ensuring that multiple users can collaborate on documents without conflict. When a user makes changes to a document, those changes are immediately broadcast to all other collaborators.

## Challenges Identified

- **Real-time Synchronization**: Managing simultaneous edits and avoiding conflicts was technically challenging.
- **Role-based Access Control**: Differentiating access levels between editors and viewers required a robust system.
- **Efficient Markdown Parsing**: Parsing and rendering Markdown in real-time without performance issues was a key technical hurdle.

## Future Improvements

- **Versioning System**: Add document version control to track changes over time.
- **Collaboration Features**: Enhance real-time collaboration with comments and annotations.
- **Offline Mode**: Enable editing documents offline with synchronization upon reconnection.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributors

- **Your Name** (GitHub: [@MahmoudElsherbinee](https://github.com/MahmoudElsherbinee))
- **Your Partner's Name** (GitHub: [@nadazaki21](https://github.com/nadazaki21))

```

This README file follows markdown syntax and includes all necessary sections like project overview, features, technologies used, installation, usage, API endpoints, challenges, and future improvements. Make sure to replace placeholders like `your-username` and `your-repo` with actual information before using it.