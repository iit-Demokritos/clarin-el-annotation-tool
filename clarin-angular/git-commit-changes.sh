#!/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# Stage all changes to see what will be committed
git add .

# Get the diff of the staged changes
GIT_DIFF=$(git diff --cached)

# If there are no changes, exit
if [ -z "$GIT_DIFF" ]; then
  echo "No changes to commit."
  # Unstage the files if nothing was there to begin with
  git reset
  exit 0
fi

echo "The following files are staged for commit:"
echo "-----------------------------------------"
git status --short
echo "-----------------------------------------"
echo ""

# Construct the prompt for the Gemini CLI
PROMPT="You are an expert in writing git commit messages that follow the Conventional Commits specification. Your task is to analyze the provided git diff and generate a concise and informative commit message including a scope.\n\n1.  Analyze the git diff to understand the changes and the affected files.\n2.  Determine a logical scope from the file paths. The scope should be a short noun describing the area of the codebase that was changed (e.g., \`auth\`, \`ui\`, \`quick-start\`, \`changelog\`, \`scripts\`).\n3.  Create a commit message that follows the scoped Conventional Commits format: \`<type>(<scope>): <description>\`.\n4.  The commit message should be a single line and accurately summarize the changes.\n\nHere is the git diff:\n---\n$GIT_DIFF\n---\n\nPlease provide only the single-line commit message as your response."

# Execute the Gemini CLI and get the commit message
# (Note: This is a conceptual representation of how the script would call the CLI)
# In a real environment, you would replace the echo with the actual gemini command.

COMMIT_MESSAGE=$(gemini -p "${PROMPT}")
# COMMIT_MESSAGE=$(echo "feat(commit): generate scoped conventional commit messages")
COMMIT_MESSAGE=${COMMIT_MESSAGE//"Loaded cached credentials."}

# Remove leading whitespace characters
COMMIT_MESSAGE="${COMMIT_MESSAGE#"${COMMIT_MESSAGE%%[![:space:]]*}"}"
# Remove trailing whitespace characters
COMMIT_MESSAGE="${COMMIT_MESSAGE%"${COMMIT_MESSAGE##*[![:space:]]}"}"

echo "Generated Commit Message:"
echo "-------------------------"
echo "$COMMIT_MESSAGE"
echo "-------------------------"
echo ""

# Ask for confirmation
read -p "Do you want to commit these changes with the message above? (y/n) " -n 1 -r
echo ""  # move to a new line

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Commit with the generated message
    git commit -m "$COMMIT_MESSAGE"; git push
    echo ""
    echo "✅ Successfully committed changes."
else
    # Unstage the files
    git reset
    echo ""
    echo "Commit aborted by user."
fi

