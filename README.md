# CollabCanvas

This is a real-time collaborative application built with Next.js, Firebase, and ShadCN UI. It features a shared whiteboard and a code editor to allow multiple users to work together seamlessly.

## Getting Started

To get this project up and running on your local machine, you'll need to download the code and set up your own Firebase project to handle the backend services like authentication and the database.

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/). `npm` (Node Package Manager) is included with Node.js.
- **Firebase Account**: You will need a Google account to create a Firebase project. It's free to get started.

---

### Step 1: Download the Code

You can download the entire codebase as a `.zip` file from the Firebase Studio interface. Once downloaded, unzip it to a folder on your computer.

---

### Step 2: Set Up Your Firebase Project

The backend of this application (authentication, database) is powered by Firebase.

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click on **"Add project"** and follow the on-screen instructions to create a new project.

2.  **Enable Authentication**:
    *   In your new Firebase project, go to the **Authentication** section from the left-hand menu.
    *   Click the **"Get started"** button.
    *   Under the "Sign-in method" tab, select **"Email/Password"** from the provider list.
    *   Enable it and click **"Save"**.

3.  **Set Up Firestore Database**:
    *   From the left-hand menu, go to the **Firestore Database** section.
    *   Click **"Create database"**.
    *   Start in **production mode**. You can change this later if needed.
    *   Choose a location for your database. Click **"Enable"**.

4.  **Get Your Firebase Config**:
    *   In the Firebase Console, go to your **Project Overview**.
    *   Click the **web icon (`</>`)** to add a web app to your project.
    *   Give your app a nickname (e.g., "CollabCanvas Local") and click **"Register app"**.
    *   Firebase will give you a `firebaseConfig` object. It will look like this:
        ```javascript
        const firebaseConfig = {
          apiKey: "AIz...",
          authDomain: "your-project-id.firebaseapp.com",
          projectId: "your-project-id",
          storageBucket: "your-project-id.appspot.com",
          messagingSenderId: "...",
          appId: "1:..."
        };
        ```
    *   **Copy this entire object.**

5.  **Add Config to Your Code**:
    *   Open the downloaded codebase in your favorite code editor.
    *   Navigate to the file: `src/firebase/config.ts`.
    *   Replace the existing content of that file with the `firebaseConfig` object you just copied from your Firebase project.

6.  **Update Firestore Security Rules**:
    *   In the codebase, find the `firestore.rules` file. Open it and copy its entire content.
    *   Go back to the **Firestore Database** section in the Firebase Console.
    *   Click on the **"Rules"** tab.
    *   Paste the copied rules into the editor, overwriting the default rules.
    *   Click **"Publish"**.

---

### Step 3: Install and Run the Application

Now that your Firebase project is set up and the code is configured, you can run the app locally.

1.  **Open a Terminal**:
    *   Navigate your terminal to the root directory where you unzipped the code.

2.  **Install Dependencies**:
    *   Run the following command to install all the necessary packages:
        ```bash
        npm install
        ```

3.  **Run the Development Server**:
    *   Start the Next.js development server with this command:
        ```bash
        npm run dev
        ```

4.  **Open in Browser**:
    *   Your terminal will show a message like `✓ Ready in 1.2s`.
    *   Open your web browser and go to **http://localhost:9002**.

You should now see the application running, connected to your own Firebase backend! You can create an account, create a room, and start collaborating.
# Colab
