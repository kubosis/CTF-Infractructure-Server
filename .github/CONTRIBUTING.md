# Contributing Guide

## Getting Started
1. Clone the repository.
2. Switch to the `devel` branch.
3. Create a new local branch based on `devel`.
4. Start working on an assigned issue.

## Adding a New Feature or Fixing an Issue
1. Review the list of open issues, or create a new issue if necessary.
2. Create a branch from the `devel` branch.  
   - Name the branch after the related issue.  
   - Do not make changes directly on `devel`.  
3. Implement your changes on the new branch.
4. Once complete, open a Pull Request (PR) into `devel`.  
   - Provide a short description of what your PR addresses.  

## Project Structure
/\
├── .github/ # CI/CD workflows, contributing guide, misc files\
├── app/ # Web application for hosting challenges\
│ ├── frontend/ # Frontend code\
│ └── backend/ # Backend code\
├── challenges/ # Base folder for CTF challenges\
├── .gitignore\
└── README.md\


## Commits

Commits should follow the syntax specified in .github/semantic.yml
```yaml
# Require both PR title and all commits to follow semantic rules
titleAndCommits: true

# Allowed semantic types (from Conventional Commits)
types:
  - feat      #  A new feature
  - fix       #  A bug fix
  - docs      #  Documentation changes only
  - style     #  Code style/formatting (no logic changes)
  - refactor  # ️ Code restructuring (no behavior change)
  - perf      #  Performance improvements
  - test      #  Adding or updating tests
  - build     #  Build system or dependencies
  - ci        #  CI/CD configuration changes
  - chore     #  Maintenance tasks (no app logic changes)
  - revert    #  Revert a previous commit
  - config    #  Configuration files changes
  - init      #  Initial commit or project setup
  - structure  #  Changes to project structure or architecture
```

E.g. after being finished with a new challenge you commit
```bash
git commit -m "feat(challenges): finished <<challenge name>>"
```

## Challenges Structure
Each challenge must be placed in its own folder inside `challenges/`.  
The folder should be named after the challenge and contain the following:

challenges/\
└── <challenge_name>/\
    ├── challenge.yml # Metadata for deployment\
    ├── Dockerfile # Container definition\
    └── (any other files required for the challenge)\

### `challenge.yml` format
The file must define the following keys:

```yaml
name: <challenge_name>
difficulty: <easy|medium|hard>
category: <Web|crypto|re|forensic|other>
points: <integer>
author: <your_name>
description: <your_description_here>
```

### Flags
- The challenge must not hardcode the flag.
- The flag is injected at runtime via the environment variable CTF_FLAG.
- The web application provides this variable when starting the container.
- Your challenge code should read the flag from this environment variable.




