# Google Workspace CLI Setup

Guide the user through setting up the Google Workspace CLI (`gws` command) locally.

## Steps

Run each step sequentially, confirming success before proceeding to the next.

### 1. Install the CLI globally

```bash
npm install -g @googleworkspace/cli
```

Verify the installation succeeded by checking `gws --version`. If the install fails, troubleshoot (e.g., permission issues may require `sudo` or fixing the npm global prefix).

### 2. Set up authentication

```bash
gws auth setup
```

This is an interactive step. Let the user follow the prompts to configure their Google Workspace credentials (client ID, client secret, etc.). Pause and wait for the user to complete the interactive setup before continuing.

### 3. Log in

```bash
gws auth login
```

This opens a browser for OAuth consent. Let the user complete the browser-based login flow.

### 4. Verify authentication

```bash
gws auth status
```

Confirm the output shows a successful authentication state. If it doesn't, help the user troubleshoot.

## Troubleshooting

- **Permission denied on install**: Suggest `sudo npm install -g @googleworkspace/cli` or configure npm to use a user-writable global directory.
- **`gws` command not found after install**: Check that the npm global bin directory is in the user's `PATH`.
- **Auth setup fails**: Ensure the user has valid Google Cloud project credentials and the necessary APIs enabled.
- **Login fails**: Check browser access and that redirect URIs are correctly configured in the Google Cloud Console.
