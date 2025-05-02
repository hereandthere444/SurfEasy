#!/bin/bash

# Script to guide users on manually uploading a local project to a GitHub repository.

echo "-------------------------------------------------------------------"
echo "  Manual GitHub Project Upload Guide"
echo "-------------------------------------------------------------------"
echo ""
echo "This script will guide you through the process of manually uploading your local project to a GitHub repository."
echo "Please follow these steps carefully."
echo ""

echo "Prerequisites:"
echo "  1. You should have a GitHub account."
echo "  2. You should have created an empty repository on GitHub (without a README, .gitignore, or LICENSE)."
echo "  3. You should have Git installed on your local machine. You can verify with: git --version"
echo ""

echo "Step 1: Navigate to Your Project Directory"
echo "   - Open your terminal or command prompt."
echo "   - Use the 'cd' command to navigate to the root directory of your project."
echo "     Example: cd /path/to/your/project"
echo ""
echo "Step 2: Initialize a Git Repository"
echo "   - In your project directory, initialize a new Git repository."
echo "     Run the command: git init"
echo "   - This will create a hidden '.git' folder in your project, which is used by Git to track your project's history."
echo ""

echo "Step 3: Stage Your Files"
echo "   - Add all the files in your project to the staging area."
echo "     Run the command: git add ."
echo "   - This command stages all files in the current directory and its subdirectories."
echo ""

echo "Step 4: Commit Your Changes"
echo "   - Commit the staged files with a descriptive message."
echo "     Run the command: git commit -m \"Initial commit: Upload project to GitHub\""
echo "   - Replace \"Initial commit: Upload project to GitHub\" with a message describing your commit."
echo ""

echo "Step 5: Add Your Remote Repository"
echo "   - Go to your GitHub repository page in your web browser."
echo "   - Copy the repository URL (it will be in the format https://github.com/your-username/your-repo-name.git or git@github.com:your-username/your-repo-name.git)."
echo "   - In your terminal, add your remote repository."
echo "     Run the command: git remote add origin <your-repository-url>"
echo "   - Replace <your-repository-url> with the URL you copied from GitHub."
echo ""

echo "Step 6: Rename the current branch to 'main'"
echo "   - It is good practice to rename your initial branch to 'main'."
echo "   - Run the command: git branch -M main"
echo ""

echo "Step 7: Push Your Local Repository to GitHub"
echo "   - Now, you can push your local commits to the remote repository on GitHub."
echo "     Run the command: git push -u origin main"
echo "   - You might be prompted to enter your GitHub username and password or use a personal access token."
echo "   - If you encounter an error stating that the remote repository already contains commits, you may need to force push, but be careful as this could overwrite the existing remote history. In that case you can use: git push -u origin main --force"
echo ""

echo "Step 8: Verify on GitHub"
echo "   - Go to your GitHub repository page in your web browser."
echo "   - Refresh the page. You should now see your project files."
echo ""

echo "Congratulations! You have successfully uploaded your project to GitHub."
echo "-------------------------------------------------------------------"